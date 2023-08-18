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
        const timeline = await Timeline.get('elonmusk')
        Timeline.disablePuppeteer()

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

        let timeline = null
        it('can return valid response using a proxy', async () => {
            try {
                timeline = await Timeline.get('elonmusk', { cookie, proxyUrl: 'https://corsproxy.io?' })
            } catch (e: unknown) {
                // Error occurred, try puppeteer for potential fix.
                await Timeline.usePuppeteer()
                timeline = await Timeline.get('elonmusk', { cookie, proxyUrl: 'https://corsproxy.io?' })
            } finally {
                expect(timeline).toBeDefined()
                assertType<TimelineTweet[]>(timeline)

                Timeline.disablePuppeteer()
            }
        })

        it('includes nsfw/sensitive tweet(s)', async () => {
            const timeline = await Timeline.get('rileyreidx3', { cookie })
    
            expect(timeline).toBeDefined()
            assertType<TimelineTweet[]>(timeline)
            expect(timeline.length).toBeGreaterThan(0)
    
            const hasSensitive = timeline.some(twt => twt.sensitive)
            expect(hasSensitive).toBe(true)
        }, 5000)
    }
})