import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer'

type DynamicProps<T> = {
    [key: string]: T
}

type DeepInfer<T> = {
    [K in keyof T]: T[K]
}

type LaunchOptions = DeepInfer<PuppeteerLaunchOptions>
export type PuppeteerConfig = LaunchOptions & {
    browser?: Browser,
    page?: Page,
    autoClose?: boolean
}

export type BaseUser = {
    name: string
    screen_name: string
    id_str: string
}

export type UserMention = BaseUser & {
    id?: number
    indices: number[]
}

export type RawTimelineUser = BaseUser & {
    blocking: boolean
    created_at: string
    default_profile: boolean
    default_profile_image: boolean
    description: string
    notifications: boolean
    following?: boolean
    followed_by?: boolean
    follow_request_sent?: boolean
    fast_followers_count: number
    normal_followers_count: number
    followers_count: number
    favourites_count: number
    listed_count: number
    media_count: number
    statuses_count: number
    friends_count: number
    location: string
    profile_banner_url: string
    profile_image_url_https: string
    protected: boolean
    verified: boolean
    is_blue_verified: boolean
    url: string
    entities?: UserEntities
    utc_offset: number
    time_zone: string
}

export type UserEntities = {
    description: { urls: DynamicProps<string>[] }
    url: { urls: UrlEntity[] }
}

export type TweetEntities = {
    hashtags: { text: string }[]
    symbols: { text: string }[]
    media: TweetMedia[]
    urls: UrlEntity[]
    user_mentions: UserMention[]
}

export type TweetMedia = UrlEntity & {
    features: DynamicProps<[]>
    id_str: string
    media_url?: string
    media_url_https: string
    original_info: {
        height: number
        width: number
        focus_rects: DynamicProps<number>[]
    }
    type: string
    sizes: {
        small: MediaSize
        medium: MediaSize
        large: MediaSize
        thumb: MediaSize
    }
}

export type UrlEntity = {
    url: string
    expanded_url: string
    display_url: string
    unwound?: {
        url: string
        status: number
        title: string
        description: string
    }
}

export type MediaSize = {
    w: number
    h: number
    resize: string
}

export type RawTimelineEntry = {
    type: string
    entry_id: string
    content: {
        tweet: RawTimelineTweet
    }
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
    possibly_sensitive?: boolean
    lang: string
    location: string
    retweeted_status?: RawTimelineTweet
    entities?: Partial<TweetEntities> 
}

export type RawTweet = {
    id_str: string
    created_at: string
    isEdited: boolean
    text: string
    conversation_count: number
    entities?: Partial<TweetEntities>
    parent?: RawTweet
    user: RawUser
}

export type RawUser = BaseUser & {
    is_blue_verified: boolean
    profile_image_url_https: string
    verified: boolean
}

export type TweetOptions = {
    retweets: boolean
    replies: boolean
    cookie?: string
    proxyUrl?: string
}