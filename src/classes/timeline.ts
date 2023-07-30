import { extractTimelineData, sendReq } from "./util.js"
import { ParseError } from "./errors.js"
import User from "./user.js"

import { 
    RawTimelineTweet, RawTimelineUser,
    TweetOptions, UserEntities 
} from "src/types.js"

const domain = 'https://twitter.com'

export default class Timeline {
    static readonly url = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/'

    static async #fetchUserTimeline(url: string) {
        const html = await sendReq(url).then(body => body.text())
        const timeline = extractTimelineData(html)
    
        if (!timeline) {
            console.error(new ParseError('Script tag not found or JSON data missing.'))
            return null
        }
    
        const data = JSON.parse(timeline)
        return data?.props?.pageProps?.timeline?.entries
    }

    static async get(
        username, 
        options: TweetOptions = { 
            replies: false, 
            retweets: false,
            proxyUrl: `https://corsproxy.io/?`
        }
    ): Promise<TimelineTweet[]>{
        const endpoint = options.proxyUrl + this.url + username + `?showReplies=true`
        const timeline = await this.#fetchUserTimeline(endpoint)

        // TODO: Properly handle error
        if (!timeline) return

        return timeline.map(e => new TimelineTweet(e.content.tweet)).filter(tweet => {
            const isRetweet = tweet.isRetweet ?? false
            const isReply = tweet.isReply ?? false
          
            return (options.retweets === isRetweet) &&
                   (options.replies === isReply)  
        });
    }

    static at = (username, index) => this.get(username).then(arr => arr[index])
    static latest = (username) => this.at(username, 0)
}

class TimelineTweet {
    id: number | string
    text: string
    createdAt: string
    inReplyToName: string
    link: string
    replyCount: number
    quoteCount: number
    retweetCount: number
    likeCount: number

    user: TimelineUser

    constructor(data: RawTimelineTweet) {
        this.id = data.id_str
        this.text = data.text
        this.createdAt = data.created_at
        this.link = domain + data.permalink
        this.quoteCount = data.quote_count
        this.replyCount = data.reply_count
        this.retweetCount = data.retweet_count
        this.likeCount = data.favorite_count
        
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
    blocking: boolean
    createdAt: string
    defaultProfile: boolean
    defaultProfileImage: boolean
    description: string
    entities: UserEntities
    followersCount: number
    friendsCount: number
    statusesCount: number
    likesCount: number
    mediaCount: number
    location: string
    protected: boolean
    url: string

    constructor(data: RawTimelineUser) {
        super(data)

        this.blocking = data.blocking
        this.createdAt = data.created_at
        this.defaultProfile = data.default_profile
        this.defaultProfileImage = data.default_profile_image
        this.entities = data.entities
        this.followersCount = data.fast_followers_count
        this.followersCount = data.normal_followers_count
        this.likesCount = data.favourites_count
        this.friendsCount = data.friends_count
        this.mediaCount = data.media_count
        this.statusesCount = data.statuses_count
        this.location = data.location
        this.url = data.url
        this.protected = data.protected
    }
}

export {
    Timeline,
    TimelineTweet,
    TimelineUser
}