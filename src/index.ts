import { fetchData } from "./parser.js"
import { RawTweet } from "./types.js"

class Timeline {
    static url = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/'

    static async get(username, includeReplies = false, includeRetweets = false) {
        const proxy = `https://corsproxy.io/?`
        const endpoint = proxy + this.url + username + `?showReplies=true`
        const res = await fetchData(endpoint)

        const tweets = res?.props?.pageProps?.timeline?.entries.map(e => new Tweet(e.content.tweet))
        return tweets.filter(tweet => {
            const isRetweet = tweet.isRetweet() ?? false
            const isReply = tweet.isReply() ?? false
          
            return (includeRetweets === isRetweet) &&
                   (includeReplies === isReply)  
        });
    }

    static at = (username, index) => this.get(username).then(arr => arr[index])
    static latest = (username) => this.at(username, 0)
}

class Tweet {
    id: number | string
    text: string
    createdAt: string
    inReplyToName: string
    link: string
    replyCount: number
    quoteCount: number
    retweetCount: number
    likeCount: number

    static domain = 'https://twitter.com'

    constructor(data: RawTweet) {
        this.id = data.id_str
        this.text = data.text
        this.createdAt = data.created_at
        this.inReplyToName = data.in_reply_to_name
        this.link = Tweet.domain + data.permalink
    }
 
    isRetweet = () => this.text.startsWith('RT @')

    isReply = () => !!this.inReplyToName
}

export {
    Timeline
}