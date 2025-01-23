import type { RawTweet, TweetEntities } from "../types.js"
import { sendReq } from "../util.js"

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
    static readonly url = 'https://cdn.syndication.twimg.com/tweet-result?'

    // TODO: This now requires a token param along with id.
    static async #fetchTweet(id: string, token: string) {
        try {
            const data = await sendReq(`${this.url}id=${id}&token=${token}`).then((res: any) => res.json())
            return data as RawTweet
        }
        catch (e: unknown) {
            const errPrefix = `An error occurred fetching Tweet '${id}'`
            const err = e instanceof Error ? e.message : e.toString()
            throw new FetchError(`${errPrefix}\n${err}`)
        }
    }

    /**
     * Gets a {@link RawTweet} by its ID and returns a {@link TweetEmbed}.
     * 
     * **A TOKEN IS REQUIRED!** You can find this token by heading to [this link](https://cdn.syndication.twimg.com/tweet-result?id=187706281200388554)
     * while logged in, and noting down the value of the `token` parameter in the URL.
     * 
     * @param id The ID of the tweet to fetch.
     * @param token Token required to fetch this tweet. 
     */
    static async get(id: string | number, token: string) {
        const tweet = await this.#fetchTweet(id.toString(), token)
        return new TweetEmbed(tweet)
    }
}

export {
    Tweet,
    TweetEmbed
}
