/* eslint-disable no-undef */
import { Timeline, TimelineTweet } from '../classes/timeline.js'

import { 
    it, describe,
    expect, expectTypeOf, assertType,
} from 'vitest'

it('timeline is setup correctly', () => {
    expect(Timeline).toHaveProperty('get')
    expect(Timeline).toHaveProperty('latest')

    expectTypeOf(Timeline.get).toBeFunction()
    expectTypeOf(Timeline.latest).toBeFunction()
})

describe('Timeline get', async () => {
    it('timeline can be retrieved after cutoff', async () => {
        let timeline = []

        try {
            timeline = await Timeline.get('elonmusk')
        } catch(e) {
            console.error(e)
        } finally {
            expect(timeline).toBeDefined()
            assertType<TimelineTweet[]>(timeline)
            expect(timeline.length).toBeGreaterThan(0)

            const latestTweetDate = new Date(timeline[0].createdAt).getTime()
            expect(latestTweetDate / 1000).toBeGreaterThan(1651363200)
        }
    })

    it('can use puppeteer with no config', async () => {
        await Timeline.usePuppeteer()
        const timeline = await Timeline.get('elonmusk', { cookie: process.env.COOKIE_STRING })
        Timeline.disablePuppeteer()

        expect(timeline).toBeDefined()
        assertType<TimelineTweet[]>(timeline)
        expect(timeline.length).toBeGreaterThan(0)
    })

    it('correctly gets matching tweets according to options', async () => {
        const timeline = await Timeline.get('elonmusk', {
            replies: false, 
            retweets: true 
        })

        expect(timeline).toBeDefined()
        assertType<TimelineTweet[]>(timeline)

        let count = timeline.length
        timeline.forEach(twt => {
            if (twt.isReply)
                count--
        })

        expect.soft(count).toEqual(timeline.length)
    })
    
    if (!process.env.GITHUB_ACTIONS) {
        const cookie = process.env.COOKIE_STRING
        expect(cookie).toBeDefined()

        it('includes nsfw/sensitive tweet(s)', async () => {
            let timeline = []

            try {
                timeline = await Timeline.get('rileyreidx3', { cookie })
            } finally {
                expect(timeline).toBeDefined()
                assertType<TimelineTweet[]>(timeline)
                expect(timeline.length).toBeGreaterThan(0)
            }
        })
    }
})