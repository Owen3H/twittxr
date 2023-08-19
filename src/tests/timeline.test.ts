/* eslint-disable no-undef */
import { Timeline, TimelineTweet } from '../classes/timeline.js'

import { 
    it, describe, 
    expect, expectTypeOf, assertType
} from 'vitest'

it('timeline is setup correctly', () => {
    expect(Timeline).toHaveProperty('get')
    expect(Timeline).toHaveProperty('latest')

    expectTypeOf(Timeline.get).toBeFunction()
    expectTypeOf(Timeline.latest).toBeFunction()
})

describe('Timeline get', async () => {
    it.skip('timeline can be retrieved successfully', async () => {

        // Expect not to be an error.
        // Expect structure is valid.
    
    })

    it('can use puppeteer with no config', async () => {
        await Timeline.usePuppeteer()
        const timeline = await Timeline.get('elonmusk', { cookie: process.env.COOKIE_STRING })
        Timeline.disablePuppeteer()

        console.log(timeline[0])

        expect(timeline).toBeDefined()
        assertType<TimelineTweet[]>(timeline)
    })

    it('correctly gets matching tweets according to options', async () => {
        const options = {
            replies: false,
            retweets: true
        }

        const timeline = await Timeline.get('elonmusk', options)
        expect(timeline).toBeDefined()

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