import mitt from 'mitt'
import type { Handler, WildcardHandler } from 'mitt'

import type { 
    AuthOptions,
    RawTimelineEntry,
    SelfTweetEvent,
    TimelineEvents
} from "../../src/types.js"

import { Timeline, TimelineTweet } from './timeline.js'

interface WatchedUser {
    tweetIds: Set<number>
    readonly scheduler: any
}

type TimelineEmitterWildcard = (type: '*', handler: WildcardHandler<TimelineEvents>) => void
type TimelineEmitterOn = (<Key extends keyof TimelineEvents>(type: Key, handler: Handler<TimelineEvents[Key]>) => void) | TimelineEmitterWildcard
type TimelineEmitterOff = (<Key extends keyof TimelineEvents>(type: Key, handler?: Handler<TimelineEvents[Key]>) => void) | TimelineEmitterWildcard

type TimelineEmitterEmit = 
    (<Key extends keyof TimelineEvents>(type: Key, event: TimelineEvents[Key]) => void) |
    (<Key extends keyof TimelineEvents>(type: undefined extends TimelineEvents[Key] ? Key : never) => void)

const USERNAME_MIN_LEN = 1
const USERNAME_MAX_LEN = 50

export class TimelineMonitor {
    readonly on: TimelineEmitterOn
    readonly off: TimelineEmitterOff
    private readonly emit: TimelineEmitterEmit

    // Store all the users tweets so that we can tell the difference between a new tweet and deleted tweet.
    private watching: Map<string, WatchedUser> = new Map()
    private readonly authOpts: AuthOptions = null

    constructor(auth: AuthOptions) {
        const emitter = mitt.default<TimelineEvents>()

        this.on = emitter.on
        this.off = emitter.off
        this.emit = emitter.emit

        this.authOpts = auth
    }
    
    /**
     * Watches the Timeline of the specified user, emitting any events that may happen such as a Tweet. 
     * @param username The name/handle of the user whose Timeline we should watch.
     * @param interval The interval (in ms) which we should keep checking this user at.
     * @see {@link TimelineEvents}
     */
    // TODO: Support watching a user by ID also - possibly as a seperate function?
    async watch(username: string, interval = 10000) {
        //#region Pre-checks
        if (username.length < USERNAME_MIN_LEN) {
            throw new Error(`Cannot watch invalid user: ${username}. Usernames must be ${USERNAME_MIN_LEN} characters or longer.`)
        }
        
        if (username.length > USERNAME_MAX_LEN) {
            throw new Error(`Cannot watch invalid user: ${username}. Usernames must be shorter than ${USERNAME_MAX_LEN} characters.`)
        }
        //#endregion

        //#region Try get timeline for the specified user.
        const timeline = await Timeline.fetch(username, this.authOpts).catch(err => {
            throw new Error(`Error occurred fetching timeline of user: ${username}.\n${err.message}`)
        })

        if (!timeline || timeline.length < 1) {
            throw new Error(`Failed to fetch timeline of: ${username}. Make sure they are a valid user.\nValue: ${timeline}`)
        }
        //#endregion

        this.watching.set(username, { 
            tweetIds: this.timelineAsTweetIds(timeline),
            scheduler: this.createScheduler(username, interval)
        })
    }

    /**
     * Stops watching a user (that was specified with {@link watch}) by clearing their associated scheduler and tweets, returning `true` if successful.\
     * If unwatch is called for a user who was not previously watched, this function will not clear anything and simply return `false`.
     */
    unwatch(username: string) {
        const watchedUser = this.watching.get(username)
        if (!watchedUser) return false

        globalThis.clearInterval(watchedUser.scheduler)
        this.watching.delete(username)
        
        return true
    }

    private createScheduler(username: string, interval: number) {
        return globalThis.setInterval(async () => {
            const watchedUser = this.watching.get(username)
            if (!watchedUser) {
                // TODO: Implement this error properly.
                // this.emit('error', {
                //     username,
                //     type: "USER_NOT_WATCHED",
                //     message: `User ${username} is not being watched but their scheduler is still running!`
                // })
                
                return
            }

            //#region Fetch timeline and emit any errors
            const timeline = await Timeline.fetch(username, this.authOpts).then(tl => {
                if (!tl || tl.length < 1) {
                    this.emit('error', { 
                        username,
                        type: "INVALID_TIMELINE",
                        message: `Failed to fetch timeline of: ${username}. Make sure they are a valid user.\nValue: ${tl}`
                    })

                    return null
                }

                return tl
            }).catch(err => {
                this.emit('error', { 
                    username, 
                    type: "FETCH_ERROR", 
                    message: `Error occurred fetching timeline of user: ${username}.\n${err.message}`
                })

                return null
            })
            //#endregion

            if (!timeline) return

            const latestEntry = timeline[0]
            const latestTweetId = latestEntry.content.tweet.id

            //#region Detected new tweet
            if (!watchedUser.tweetIds.has(latestTweetId)) {
                watchedUser.tweetIds.add(latestTweetId)

                const selfTweetEvent: SelfTweetEvent = {
                    timelineEntry: latestEntry,
                    getTweet() {
                        return new TimelineTweet(this.timelineEntry.content.tweet)
                    }
                }

                this.emit('selfTweet', selfTweetEvent)
            }
            //#endregion
        }, interval)
    }

    private timelineAsTweetIds(timeline: RawTimelineEntry[]) {
        const ids = timeline.filter(e => !!e.content?.tweet).map(e => e.content.tweet.id)
        return new Set(ids)
    }
}