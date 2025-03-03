import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer'
import type { TimelineTweet } from './classes/timeline.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Impossible<K extends keyof any> = { [P in K]: never }

export type Exact<T, U extends T = T> = 
    U & Impossible<Exclude<keyof U, keyof T>>

type DynamicProps<T> = { [key: string]: T }
type DeepInfer<T> = { [K in keyof T]: T[K] }

type LaunchOptions = DeepInfer<PuppeteerLaunchOptions>

export interface PuppeteerConfig extends LaunchOptions {
    browser?: Browser
    page?: Page
    autoClose?: boolean
}

export type TwitterCookies = Exact<{
    guest_id?: string
    auth_token: string
    //auth_multi?: string
    ct0: string
    kdt: string
}>

export interface BaseUser {
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
    withheld_in_countries: any[] // Not sure of exact type yet, likely string?
    show_all_inline_media: boolean
}

export interface UserEntities {
    description: { urls: DynamicProps<string>[] }
    url: { urls: UrlEntity[] }
}

export interface TweetEntities {
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

export interface UrlEntity {
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

export interface MediaSize {
    w: number
    h: number
    resize: string
}

export interface RawTimelineResponse {
    page: string
    query: {
        screenName: string
    }
    props: {
        pageProps: {
            lang: string
            timeline: {
                entries: RawTimelineEntry[]
            }
        }
    }
}

export interface RawTimelineEntry {
    type: string
    entry_id: string
    content: {
        tweet: RawTimelineTweet
    }
}

export interface RawTimelineTweet {
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

export interface RawTweet {
    id_str: string
    created_at: string
    isEdited: boolean
    text: string
    conversation_count: number
    entities?: Partial<TweetEntities>
    parent?: RawTweet
    user: RawUser
}

export type ProfileImageShape = 'Circle' | 'Square'

export interface RawUser extends BaseUser {
    is_blue_verified: boolean
    profile_image_url_https: string
    profile_image_shape?: ProfileImageShape
    verified: boolean
}

export interface TweetOptions {
    retweets: boolean
    replies: boolean
}

export interface AuthOptions {
    cookie?: string | TwitterCookies
    //token: string // TODO: If timeline doesn't need this, we can just remove it as Tweet.get already requires it.
}

// Can't be 'interface' as it won't satisfy Emitter.
export type TimelineEvents = {
    selfTweet: SelfTweetEvent
    error: {
        err: string
        msg: string
    }
}

export interface SelfTweetEvent {
    timelineEntry: RawTimelineEntry
    getTweet(): TimelineTweet
}