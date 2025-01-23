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

// Magic idek. Grabbed from react-tweet.
const getTokenFromID = (id: string | number) => {
    return ((Number(id) / 1e15) * Math.PI).toString(6 ** 2).replace(/(0+|\.)/g, '')
}

const SYNDICATION_URL = 'https://cdn.syndication.twimg.com/tweet-result?'

export default class Tweet {
    static async #fetchTweet(id: string) {
        try {
            const url = `${SYNDICATION_URL}id=${id}&token=${getTokenFromID(id)}&dnt=1`
            const data = await sendReq(url).then((res: any) => res.json())
            
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
     * @param id The ID of the tweet to fetch.
     * @param token Token required to fetch this tweet. 
     */
    static async get(id: string | number) {
        const tweet = await this.#fetchTweet(id.toString())
        return new TweetEmbed(tweet)
    }

    // Bring back when we can no longer get token from ID.
    //  * **A TOKEN IS REQUIRED!** You can find this token by doing the following:
    //  * 1. Opening **Inspect Element** -> **Network Requests**.
    //  * 2. Heading to [this link](https://platform.twitter.com/embed/Tweet.html?dnt=false&id=1877062812003885543) while logged in.
    //  * 3. Find the `tweet-result` request and copy the value of the `token` key under the **Payload** tab.
}

export {
    Tweet,
    TweetEmbed
}
