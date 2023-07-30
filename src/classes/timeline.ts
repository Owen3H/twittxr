import { extractTimelineData, sendReq } from "./util.js"
import { RawTimelineTweet, RawTimelineUser } from "../types.js"

const domain = 'https://twitter.com'

export default class Timeline {
    static readonly url = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/'

    static async #fetchUserTimeline(url: string) {
        const html = await sendReq(url).then(body => body.text())
        const timeline = extractTimelineData(html)
    
        if (!timeline) {
            console.error(new Error('Script tag not found or JSON data missing.'))
            return null
        }
    
        const data = JSON.parse(timeline)
        return data?.props?.pageProps?.timeline?.entries
    }

    static async get(username, includeReplies = false, includeRetweets = false) {
        const proxy = `https://corsproxy.io/?`
        const endpoint = proxy + this.url + username + `?showReplies=true`

        const timeline = await this.#fetchUserTimeline(endpoint)
        if (!timeline) return

        return timeline.map(e => new TimelineTweet(e.content.tweet)).filter(tweet => {
            const isRetweet = tweet.isRetweet() ?? false
            const isReply = tweet.isReply() ?? false
          
            return (includeRetweets === isRetweet) &&
                   (includeReplies === isReply)  
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

    user: RawTimelineUser

    constructor(data: RawTimelineTweet) {
        this.id = data.id_str
        this.text = data.text
        this.createdAt = data.created_at
        this.link = domain + data.permalink
        this.user = data.user

        if (data.in_reply_to_name)
            this.inReplyToName = data.in_reply_to_name
    }
 
    isRetweet = () => this.text.startsWith('RT @')

    isReply = () => !!this.inReplyToName
}

export {
    Timeline
}