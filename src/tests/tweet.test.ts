/* eslint-disable no-undef */
import { Tweet } from '../classes/tweet.js'

test('Tweet is setup correctly', () => {
    expect(Tweet).toHaveProperty('get')
    expectTypeOf(Tweet.get).toBeFunction()

    expectTypeOf(Tweet.get).toBeCallableWith('1688091377823895552')
    expectTypeOf(Tweet.get).toBeCallableWith(1688091377823895552)
})

test('single tweet can be retrieved successfully', async () => {
    const tweet = await Tweet.get('1674865731136020505')

    expect(tweet).toBeDefined()
    expect(tweet.user).toBeDefined()
})

describe('Tweet get', () => {
    it.skip('', () => {

    })
})
