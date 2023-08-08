import { RawTweet, TweetEntities } from "src/types.js"
import { sendReq } from "./util.js"

import User from "./user.js"

class TweetEmbed {
    conversationCount?: number
    createdAt: string
    id: string | number
    text: string
    isEdited: boolean
    entities: TweetEntities
    parent?: TweetEmbed
    user: User
    inReplyToName?: string

    constructor(data: RawTweet) {
        this.createdAt = data.created_at
        this.id = data.id_str
        this.text = data.text
        this.isEdited = data.isEdited
        this.entities = data.entities

        const convoCount = data.conversation_count
        if (convoCount) this.conversationCount = convoCount   
        
        const user = data.user
        if (user) this.user = new User(user)

        const parent = data.parent
        if (parent) this.parent = new TweetEmbed(parent)
    }

    get isRetweet() {
        return this.text.startsWith('RT @')
    }

    get isReply() { 
        return !!this.inReplyToName
    }
}

export default class Tweet {
    static readonly url = 'https://cdn.syndication.twimg.com/tweet-result?id='

    static async #fetchTweet(url: string) {
        const data = await sendReq(url).then(body => body.json())
        return data
    }

    static async get(id: string | number) {
        const tweet = await this.#fetchTweet(this.url + id)
        return new TweetEmbed(tweet)
    }
}

export {
    Tweet,
}
