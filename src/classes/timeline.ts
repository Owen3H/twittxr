import { 
    buildCookieString, extractTimelineData, 
    getPuppeteerContent, sendReq 
} from "../util.js"

import { FetchError, ParseError } from "./errors.js"
import User from "./user.js"

import type { 
    AuthOptions,
    PuppeteerConfig,
    RawTimelineEntry,
    RawTimelineResponse,
    RawTimelineTweet, RawTimelineUser,
    TweetEntities,
    TweetOptions, UserEntities 
} from "../types.js"

const domain = 'https://x.com'

type PuppeteerOpts = { 
    use: 'always' | 'fallback' | 'never', 
    config: PuppeteerConfig 
}

export const TIMELINE_URL = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/'

export default class Timeline {
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

    /**
     * Fetches a user's timeline by calling to the Syndication API's timeline embed endpoint and parsing the resulting HTML text into usable JS objects.\
     * To get a tweet from the collection of entries, simply grab the `content.tweet` of an element which will give you a {@link RawTimelineTweet}.
     * 
     * **NOTE**: This method should only be used if you need the raw timeline data for whatever reason.\
     * In most cases, it is suggested to use `Timeline.get()` which includes additional filter options.
     * @param username The user handle without the `@`.
     * @param cookie The full acquired cookie string.
     * @see {@link TIMELINE_URL}
     */
    static async fetch(username: string, cookie?: string): Promise<RawTimelineEntry[]> {
        const url = `${TIMELINE_URL}${username}`
        const html = this.puppeteer.use
            ? await getPuppeteerContent({ ...this.puppeteer.config, url, cookie }) 
            : await sendReq(url, cookie).then((body: any) => body.text()).catch(async err => {
                // Can't fallback, re-throw original error.
                const puppeteer = await import('puppeteer')
                if (!puppeteer) throw err

                const config = this.puppeteer.config
                if (!config.browser) await this.usePuppeteer(null, true)

                const content = await getPuppeteerContent({ ...config, url, cookie })
                //console.log(content)
                
                return content
            })

        const data = extractTimelineData(html)
        if (!data) throw new ParseError('Script tag not found or JSON data is missing.')
    
        const timeline = JSON.parse(data) as RawTimelineResponse
        return timeline?.props?.pageProps?.timeline?.entries
    }

    /**
     * Retrieves all tweets from an account by their username/handle. 
     * 
     * **Default behaviour**
     * - Replies and retweets are not included.
     * - No cookie is set - must be user defined.
     * 
     * Example:
     * ```js
     * await Timeline.get('elonmusk', { cookie: process.env.TWITTER_COOKIE }, { 
     *ㅤㅤreplies: true, 
     *ㅤㅤretweets: false, 
     * })
     * ```
     * @param username The user's handle without the `@`.
     * @param auth The auth options to use with the request. See {@link AuthOptions}.
     * @param options The tweet options to use with the request, see {@link TweetOptions}.
     */
    static async get(username: string, auth: AuthOptions, options: Partial<TweetOptions> = {}) {
        try {
            const parsedCookie = typeof auth.cookie === 'string' ? auth.cookie : buildCookieString(auth.cookie)
            const timeline = await this.fetch(username, parsedCookie)

            // TEMPORARY DEBUGGING
            // if (username == "rileyreidx3") 
            //     console.log(timeline)

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
    static latest = (username: string, auth: AuthOptions, options: Partial<TweetOptions> = {}) =>
        Timeline.get(username, auth, options).then(arr => arr[0])
}

class TimelineTweet {
    readonly id: number
    readonly idStr: string

    readonly text: string
    readonly fullText: string
    readonly displayTextRange: number[]

    readonly createdAt: string
    readonly inReplyToName?: string
    readonly permalink: string
    readonly replyCount: number
    readonly quoteCount: number
    readonly retweetCount: number
    readonly likeCount: number

    readonly user: TimelineUser
    readonly sensitive?: boolean

    readonly favourited: boolean
    readonly retweeted: boolean
    readonly retweetedStatus: TimelineTweet

    readonly entities?: Partial<TweetEntities>
    readonly extendedEntities?: Partial<TweetEntities>

    constructor(data: RawTimelineTweet) {
        this.id = data.id
        this.idStr = data.id_str

        this.text = data.text
        this.fullText = data.full_text
        this.displayTextRange = data.display_text_range

        this.createdAt = data.created_at
        this.permalink = data.permalink
        this.quoteCount = data.quote_count
        this.replyCount = data.reply_count
        this.retweetCount = data.retweet_count
        this.likeCount = data.favorite_count
        this.sensitive = data.possibly_sensitive ?? false

        this.favourited = data.favorited
        this.retweeted = data.retweeted

        this.entities = data.entities
        this.extendedEntities = data.extended_entities

        if (data.retweeted_status) {
            this.retweetedStatus = new TimelineTweet(data.retweeted_status)
        }

        if (data.user) {
            this.user = new TimelineUser(data.user)
        }

        if (data.in_reply_to_name) {
            this.inReplyToName = data.in_reply_to_name
        }
    }

    get isRetweet() {
        return this.text.startsWith('RT @')
    }

    get isReply() {
        return !!this.inReplyToName
    }
    
    get link() {
        return domain + this.permalink
    }
}

class TimelineUser extends User {
    readonly url: string
    readonly createdAt: string
    readonly defaultProfile: boolean
    readonly defaultProfileImage: boolean
    readonly description: string
    readonly entities: UserEntities

    readonly notifications: boolean
    readonly protected: boolean
    readonly blocking: boolean
    readonly following: boolean
    readonly followedBy: boolean
    readonly followRequestSent: boolean

    readonly followersCount: number
    readonly fastFollowersCount: number
    readonly normalFollowersCount: number
    readonly friendsCount: number
    readonly statusesCount: number
    readonly favouritesCount: number
    readonly mediaCount: number
    readonly listedCount: number

    readonly location: string
    readonly timezone: string
    readonly utcOffset: number

    readonly isTranslator: boolean
    readonly translatorType: string

    readonly hasCustomTimelines: boolean
    readonly showAllInlineMedia: boolean

    readonly withheldScope: string
    readonly withheldInCountries: any[] // Not sure of exact type yet, likely string?

    constructor(data: RawTimelineUser) {
        super(data)

        this.url = data.url
        this.createdAt = data.created_at
        this.defaultProfile = data.default_profile
        this.defaultProfileImage = data.default_profile_image
        this.description = data.description
        this.entities = data.entities

        this.notifications = data.notifications
        this.protected = data.protected
        this.blocking = data.blocking
        this.following = data.following
        this.followedBy = data.followed_by
        this.followRequestSent = data.follow_request_sent

        this.followersCount = data.followers_count
        this.fastFollowersCount = data.fast_followers_count
        this.normalFollowersCount = data.normal_followers_count
        this.favouritesCount = data.favourites_count
        this.friendsCount = data.friends_count
        this.mediaCount = data.media_count
        this.statusesCount = data.statuses_count
        this.listedCount = data.listed_count

        this.location = data.location
        this.timezone = data.time_zone
        this.utcOffset = data.utc_offset

        this.isTranslator = data.is_translator
        this.translatorType = data.translator_type

        this.hasCustomTimelines = data.has_custom_timelines
        this.showAllInlineMedia = data.show_all_inline_media

        this.withheldScope = data.withheld_scope
        this.withheldInCountries = data.withheld_in_countries
    }

    get likes() {
        return this.favouritesCount
    }
}

export {
    Timeline,
    TimelineTweet,
    TimelineUser
}