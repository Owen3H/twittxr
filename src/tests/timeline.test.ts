/* eslint-disable no-undef */
import { Timeline } from '../classes/timeline.js'

test('timeline is setup correctly', () => {
    expect(Timeline).toHaveProperty('get')
    expect(Timeline).toHaveProperty('at')
    expect(Timeline).toHaveProperty('latest')

    expectTypeOf(Timeline.get).toBeFunction()
    expectTypeOf(Timeline.at).toBeFunction()
    expectTypeOf(Timeline.latest).toBeFunction()
})

test.skip('timeline can be retrieved successfully', async () => {
    const timeline = await Timeline.get('elonmusk')
    expect(timeline).toBeDefined()

    // Expect correct type
    // Expect structure is valid.

})

test('timeline can retrieve maximum tweets', async () => {
    const timeline = await Timeline.get('elonmusk', {
        replies: false,
        retweets: false,
        proxyUrl: ''
    })

    expectTypeOf(timeline).toBeArray()
    expect(timeline.length).toBeGreaterThanOrEqual(20)
})

test.skip('timeline can use cookie to include NSFW tweets', () => {
    
})