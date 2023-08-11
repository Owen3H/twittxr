/* eslint-disable no-undef */
import { Timeline, TimelineTweet } from '../classes/timeline.js'

test('timeline is setup correctly', () => {
    expect(Timeline).toHaveProperty('get')
    expect(Timeline).toHaveProperty('at')
    expect(Timeline).toHaveProperty('latest')

    expectTypeOf(Timeline.get).toBeFunction()
    expectTypeOf(Timeline.at).toBeFunction()
    expectTypeOf(Timeline.latest).toBeFunction()
})

describe('Timeline get', () => {
    test.skip('timeline can be retrieved successfully', async () => {

        // Expect not to be an error.
        // Expect structure is valid.
    
    })

    test('correctly gets matching tweets according to options', async () => {
        const options = {
            replies: false,
            retweets: false
        }

        const timeline = await Timeline.get('elonmusk', options)
        expect(timeline).toBeDefined()

        let count = timeline.length
        timeline.forEach(twt => {
            if (twt.isRetweet || twt.isReply)
                count--
        })

        expect.soft(count).toEqual(timeline.length)
    })
    
    test('can return valid response using a proxy', async () => {
        const timeline = await Timeline.get('elonmusk')

        expect(timeline).toBeDefined()
        assertType<TimelineTweet[]>(timeline)
    })

    if (!process.env.GITHUB_ACTIONS) {
        const cookie = process.env.COOKIE_STRING
        expect(cookie).toBeDefined()

        test('includes nsfw/sensitive tweet(s)', async () => {
            const timeline = await Timeline.get('rileyreidx3', { cookie, proxyUrl: '' })
    
            expect(timeline).toBeDefined()
            assertType<TimelineTweet[]>(timeline)
            expect(timeline.length).toBeGreaterThan(0)
    
            const hasSensitive = timeline.some(twt => twt.sensitive)
            expect(hasSensitive).toBe(true)
        }, 5000)
    }
})