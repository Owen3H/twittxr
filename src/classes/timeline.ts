import { 
    buildCookieString, extractTimelineData, 
    getPuppeteerContent, sendReq 
} from "../util.js"

import { FetchError, ParseError } from "./errors.js"
import User from "./user.js"

import type { 
    PuppeteerConfig,
    RawTimelineEntry,
    RawTimelineResponse,
    RawTimelineTweet, RawTimelineUser,
    TweetOptions, UserEntities 
} from "../types.js"

const domain = 'https://x.com'

type PuppeteerOpts = { 
    use: 'always' | 'fallback' | 'never', 
    config: PuppeteerConfig 
}

export default class Timeline {
    static readonly url = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/'
    private static puppeteer: PuppeteerOpts = { 
        use: 'never',
        config: null
    }

    /**
     * Use puppeteer to get the timeline, bypassing potential Cloudflare issues.
     * Unless `browser` is defined in {@link config}, a basic headless one is used.
     * 
     * @param config Used to configure how Puppeteer should behave.
     */
    static async usePuppeteer(config?: PuppeteerConfig, asFallback = false) {
        //if (!this.puppeteer.use) return
        this.puppeteer.use = asFallback ? 'fallback' : 'always'

        if (!config) {
            return await this.setBasicBrowser()
        }

        if (!config.browser) {
            const puppeteer = await this.tryGetPuppeteer()
            config.browser = await puppeteer.launch(config)
        }

        this.puppeteer.config = config
    }

    static async disablePuppeteer() {
        this.puppeteer.use = 'never'
    }

    private static async setBasicBrowser() {
        const puppeteer = await this.tryGetPuppeteer()
        this.puppeteer.config = {
            browser: await puppeteer.launch({ headless: 'shell' }),
            autoClose: true
        }
    }

    private static async tryGetPuppeteer() {
        const puppeteer = await import('puppeteer')
        if (!puppeteer) throw new ReferenceError(`
            Puppeteer not found! Did you forget to install the peer dependency?
            \nMake sure it exists in your node_modules directory before using Puppeteer.
        `)

        return puppeteer
    }

    static async #fetchUserTimeline(url: string, cookie?: string): Promise<RawTimelineEntry[]> {
        const html = this.puppeteer.use
            ? await getPuppeteerContent({ ...this.puppeteer.config, url, cookie }) 
            : await sendReq(url, cookie).then((body: any) => body.text()).catch(async err => {
                // Can't fallback, re-throw original error.
                const puppeteer = await import('puppeteer')
                if (!puppeteer) throw err

                const config = this.puppeteer.config
                if (!config.browser) await this.usePuppeteer(null, true)

                const content = await getPuppeteerContent({ ...config, url, cookie })
                console.log(content)
                
                return content
            })

        const data = extractTimelineData(html)
        if (!data) throw new ParseError('Script tag not found or JSON data is missing.')
    
        const timeline = JSON.parse(data) as RawTimelineResponse
        return timeline?.props?.pageProps?.timeline?.entries
    }

    /**
     * Fetches all tweets by the specified user. 
     * 
     * **Default behaviour**
     * - Replies and retweets are not included.
     * - No cookie is set - must be user defined.
     * 
     * @param username The user handle without the ``@``.
     * @param options The options to use with the request, see {@link TweetOptions}.
     * 
     * Example:
     * ```js
     * await Timeline.get('elonmusk', { 
     *ㅤㅤreplies: true, 
     *ㅤㅤretweets: false, 
     *ㅤㅤcookie: process.env.TWITTER_COOKIE 
     * })
     * ```
     */
    static async get(
        username: string, 
        options: Partial<TweetOptions> = {}
    ) {
        // Since `replies` could be `any` when compiled, check defined with !!
        const endpoint = `${this.url}${username}`

        try {
            const parsedCookie = typeof options.cookie === 'string' 
                ? options.cookie : buildCookieString(options.cookie)

            const timeline = await this.#fetchUserTimeline(endpoint, parsedCookie)
            const tweets = timeline.map(e => new TimelineTweet(e.content.tweet))

            const includeReplies = options.replies || false
            const includeRts = options.retweets || false

            return tweets.filter(t => t.isRetweet === includeRts && t.isReply === includeReplies)
        } catch (e: unknown) {
            const errPrefix = `An error occurred fetching Timeline of '${username}'`
            const err = e instanceof Error ? e.message : e.toString()
            throw new FetchError(`${errPrefix}\n${err}`)
        }
    }

    /**
     * Works exactly the same as `.get()`, but just returns the most recent tweet.
     * 
     * Intended to be used as shorthand for the following:
     * ```js
     * await Timeline.get('user').then(arr => arr[0])
     * ```
     */
    static latest = (username: string, options: Partial<TweetOptions> = {}) =>
        Timeline.get(username, options).then(arr => arr[0])
}

class TimelineTweet {
    readonly id: string
    readonly text: string
    readonly createdAt: string
    readonly inReplyToName: string
    readonly link: string
    readonly replyCount: number
    readonly quoteCount: number
    readonly retweetCount: number
    readonly likeCount: number

    readonly user: TimelineUser
    readonly sensitive?: boolean
    
    constructor(data: RawTimelineTweet) {
        this.id = data.id_str ?? data.conversation_id_str
        this.text = data.text
        this.createdAt = data.created_at
        this.link = domain + data.permalink
        this.quoteCount = data.quote_count
        this.replyCount = data.reply_count
        this.retweetCount = data.retweet_count
        this.likeCount = data.favorite_count
        this.sensitive = data.possibly_sensitive ?? false

        if (data.user) this.user = new TimelineUser(data.user)
        if (data.in_reply_to_name)
            this.inReplyToName = data.in_reply_to_name
    }

    get isRetweet() {
        return this.text.startsWith('RT @')
    }

    get isReply() {
        return !!this.inReplyToName
    }
}

class TimelineUser extends User {
    readonly blocking: boolean
    readonly createdAt: string
    readonly defaultProfile: boolean
    readonly defaultProfileImage: boolean
    readonly description: string
    readonly entities: UserEntities
    readonly followersCount: number
    readonly friendsCount: number
    readonly statusesCount: number
    readonly likesCount: number
    readonly mediaCount: number
    readonly location: string
    readonly protected: boolean
    readonly url: string
    readonly time_zone: string
    readonly listedCount: number
    readonly utc_offset: number
    readonly notifications: boolean
    readonly following: boolean
    readonly followedBy: boolean
    readonly followRequestSent: boolean

    constructor(data: RawTimelineUser) {
        super(data)

        this.url = data.url
        this.createdAt = data.created_at
        this.defaultProfile = data.default_profile
        this.defaultProfileImage = data.default_profile_image
        this.entities = data.entities
        
        this.blocking = data.blocking
        this.protected = data.protected
        this.notifications = data.notifications
        this.following = data.following
        this.followedBy = data.followed_by
        this.followRequestSent = data.follow_request_sent

        this.followersCount = data.fast_followers_count
        this.followersCount = data.normal_followers_count
        this.likesCount = data.favourites_count
        this.friendsCount = data.friends_count
        this.mediaCount = data.media_count
        this.statusesCount = data.statuses_count
        this.listedCount = data.listed_count

        this.location = data.location
        this.time_zone = data.time_zone
        this.utc_offset = data.utc_offset
    }
}

export {
    Timeline,
    TimelineTweet,
    TimelineUser
}