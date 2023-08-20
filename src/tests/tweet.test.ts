/* eslint-disable no-undef */
import { 
    it, describe, 
    expect, expectTypeOf, assertType
} from 'vitest'

import { Tweet, TweetEmbed } from '../classes/tweet.js'

it('Tweet is setup correctly', () => {
    expect(Tweet).toHaveProperty('get')
    expectTypeOf(Tweet.get).toBeFunction()

    expectTypeOf(Tweet.get).toBeCallableWith('1688091377823895552')
    expectTypeOf(Tweet.get).toBeCallableWith(1688091377823895552)
})

it('single tweet can be retrieved successfully', async () => {
    const tweet = await Tweet.get('1674865731136020505')
    expect(tweet).toBeDefined()
    assertType<TweetEmbed>(tweet)
})

describe('Tweet get', () => {
    it.skip('', () => {

    })
})
