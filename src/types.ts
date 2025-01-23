import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Impossible<K extends keyof any> = {
    [P in K]: never
}

export type Exact<T, U extends T = T> = 
    U & Impossible<Exclude<keyof U, keyof T>>

type DynamicProps<T> = {
    [key: string]: T
}

type DeepInfer<T> = {
    [K in keyof T]: T[K]
}

type LaunchOptions = DeepInfer<PuppeteerLaunchOptions>

export interface PuppeteerConfig extends LaunchOptions {
    browser?: Browser
    page?: Page
    autoClose?: boolean
}

export type TwitterCookies = Exact<{
    guest_id?: string
    auth_token: string
    auth_multi?: string
    ct0: string
    kdt: string
}>

export type BaseUser = {
    name: string
    screen_name: string
    id_str: string
}

export interface UserMention extends BaseUser {
    id?: number
    indices: number[]
}

export interface RawTimelineUser extends BaseUser {
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
    has_custom_timelines: boolean
    is_translator: boolean
    //highlightedLabel: any
    translator_type: string
    withheld_scope: string
    //withheld_in_countries: any[]
    notificiations: boolean
    show_all_inline_media: boolean
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

export interface TweetMedia extends UrlEntity {
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

export type RawTimelineResponse = {
    props: {
        pageProps: {
            timeline: {
                entries: RawTimelineEntry[]
            }
        }
    }
}

export type RawTimelineEntry = {
    type: string
    entry_id: string
    content: {
        tweet: RawTimelineTweet
    }
}

export type RawTimelineTweet = {
    id: number
    id_str: string
    conversation_id_str: string
    text: string
    full_text: string
    display_text_range: number[]
    in_reply_to_name?: string
    created_at: string
    permalink: string
    reply_count: number
    quote_count: number
    retweet_count: number
    favorite_count: number
    favorited: boolean
    retweeted: boolean
    user: RawTimelineUser
    possibly_sensitive?: boolean
    retweeted_status?: RawTimelineTweet
    entities?: Partial<TweetEntities>
    extended_entities?: Partial<TweetEntities>
    lang: string
    location: string
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

export interface RawUser extends BaseUser {
    is_blue_verified: boolean
    profile_image_url_https: string
    verified: boolean
}

export type TweetOptions = {
    retweets: boolean
    replies: boolean
    cookie?: string | TwitterCookies
}