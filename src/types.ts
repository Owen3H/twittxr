export type BaseUser = {
    name: string
    screen_name: string
    id_str: string
}

export type UserMention = BaseUser & {
    indices: number[]
}

export type RawTimelineUser = BaseUser & {
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
    entities: UserEntities
}

export type UserEntities = {
    description: {
        urls: { [key: string]: string }
    }
    url: {
        urls: { [key: string]: string }
    }
}

export type TweetEntities = {
    hashtags?: any[]
    media?: any[]
    symbols: any[]
    urls: any[]
    user_mentions?: UserMention[]
}

export type RawTimelineTweet = {
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

export type RawTweet = {
    parent: any
    user: RawUser
    conversation_count: any
    entities: TweetEntities
    isEdited: boolean
    text: string
    id_str: string|number
    created_at: string
}

export type RawUser = {
    id_str: string;
    is_blue_verified: boolean;
    name: string;
    profile_image_url_https: string;
    screen_name: string;
    verified: boolean;
}

export type TweetOptions = {
    retweets: boolean
    replies: boolean
    cookie?: string
    proxyUrl?: string
}