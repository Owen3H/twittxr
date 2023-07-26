type RawTweet = {
    id_str: string | number
    text: string
    in_reply_to_name: string
    created_at: string
    permalink: string
    replyCount: number
    quoteCount: number
    retweetCount: number
    likeCount: number
    user: RawUser
}

type RawUser = {
    
}

export {
    RawTweet,
    RawUser
}