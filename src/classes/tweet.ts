import { RawTweet, TweetEntities } from "../types.js"
import { sendReq } from "./util.js"

import User from "./user.js"
import { FetchError } from "./errors.js"

class TweetEmbed {
    readonly conversationCount?: number
    readonly createdAt: string
    readonly id: string
    readonly text: string
    readonly isEdited: boolean
    readonly entities: Partial<TweetEntities>
    readonly parent?: TweetEmbed
    readonly user: User
    readonly inReplyToName?: string

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

    static async #fetchTweet(id: string) {
        try {
            const data = await sendReq(this.url + id).then(body => body.json())
            return data as RawTweet
        }
        catch (e: unknown) {
            const errPrefix = `An error occurred fetching Tweet '${id}'`
            const err = e instanceof Error ? e.message : e.toString()
            throw new FetchError(`${errPrefix}\n${err}`)
        }
    }

    static async get(id: string | number) {
        const tweet = await this.#fetchTweet(id.toString())
        return new TweetEmbed(tweet)
    }
}

export {
    Tweet,
}
