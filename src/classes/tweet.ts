import type { RawTweet, TweetEntities } from "../types.js"
import { isNumeric, sendReq } from "../util.js"

import User from "./user.js"
import { FetchError } from "./errors.js"

// Grabbed from react-tweet and edited a bit for clarity :P
function tokenFromID(id: string) {
    return ((Number(id) / 1e15) * Math.PI)
        .toString(36) // Base 36 (a-z, 0-9)
        .replace(/(0+|\.)/g, '') // Strip trailing zeros.
}

const SYNDICATION_TWEET_URL = 'https://cdn.syndication.twimg.com/tweet-result'

export default class Tweet {
    /**
     * Fetches a tweet by its ID by calling to the Syndication API's tweet embed endpoint.\
     * The JSON object is immediately returned regardless of contents, please handle this accordingly!
     * 
     * **NOTE**: This method should only be used if you need the raw object for whatever reason.\
     * In most cases, it is suggested to use `Tweet.get()` instead which checks for tweet existence.
     * @param id The ID of the tweet to fetch - must represent a valid ID.
     * @returns The tweet object ({@link RawTweet}) from the JSON response.
     * @see {@link SYNDICATION_TWEET_URL}
     */
    static async fetch(id: string | number): Promise<RawTweet> {
        try {
            id = id.toString()
            if (id.length > 40) {
                throw new Error("Tweet ID too long! Must be less than 40 characters.")
            }

            if (!isNumeric(id)) {
                throw new Error(`Tweet ID must be a number!`)
            }

            const url = new URL(SYNDICATION_TWEET_URL)
            url.searchParams.set("id", id)
            url.searchParams.set("token", tokenFromID(id))
            url.searchParams.set("dnt", "1") // Send Do-Not-Track signal.

            return sendReq(url.toString()).then((res: any) => res.json())
        }
        catch (e: unknown) {
            const err = e instanceof Error ? e.message : e.toString()
            throw new FetchError(`Error fetching Tweet with ID: ${id}\n${err}`)
        }
    }

    /**
     * Gets a tweet by its ID or `null` if it does not exist. Returned object is parsed as a {@link TweetEmbed}.
     * @param id The ID of the tweet to fetch - must represent a valid ID.
     */
    static async get(id: string | number) {
        const tweet = await this.fetch(id)
        if (!tweet || Object.keys(tweet).length == 0) {
            return null
        }

        return new TweetEmbed(tweet)
    }

    // Bring back these docs when we can no longer get token from ID.
    //  * **A TOKEN IS REQUIRED!** You can find this token by doing the following:
    //  * 1. Opening **Inspect Element** -> **Network Requests**.
    //  * 2. Heading to [this link](https://platform.twitter.com/embed/Tweet.html?dnt=false&id=1877062812003885543) while logged in.
    //  * 3. Find the `tweet-result` request and copy the value of the `token` key under the **Payload** tab.
}

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

export {
    Tweet,
    TweetEmbed
}
