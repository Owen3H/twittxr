type BaseUser = {
    name: string
    screen_name: string
    id_str: string
}

type UserMention = BaseUser & {
    indices: number[]
}

type RawTimelineUser = BaseUser & {
    blocking: boolean
    created_at: string
    default_profile: boolean
    default_profile_image: boolean
    description: string
    fast_followers_count: number
    normal_followers_count: number
    followers_count: number
    favourites_count: number
    media_count: number
    statuses_count: number
    friends_count: number
    location: string
    listed_count: number
    profile_banner_url: string
    profile_image_url_https: string
    protected: boolean
    verified: boolean
    is_blue_verified: boolean
    url: string
}

type TweetEntities = {
    hashtags?: any[]
    media?: any[]
    symbols: any[]
    urls: any[]
    user_mentions?: UserMention[]
}

type RawTimelineTweet = {
    conversation_id_str: string
    id_str: string
    text: string
    in_reply_to_name: string
    created_at: string
    permalink: string
    reply_count: number
    quote_count: number
    retweet_count: number
    favorite_count: number
    user: RawTimelineUser
    possibly_sensitive: boolean
    lang: string
    location: string
    retweeted_status?: RawTimelineTweet
    entities?: TweetEntities 
}

export {
    RawTimelineTweet,
    RawTimelineUser,
    TweetEntities,
}