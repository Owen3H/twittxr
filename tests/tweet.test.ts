import { 
    it, expect,
    expectTypeOf, assertType
} from 'vitest'

import { Tweet, type TweetEmbed } from '../src/classes/tweet.js'

it('Tweet class is setup correctly', () => {
    expect(Tweet).toHaveProperty('get')
    expectTypeOf(Tweet.get).toBeFunction()

    expectTypeOf(Tweet.get).toBeCallableWith('1688091377823895552')
    expectTypeOf(Tweet.get).toBeCallableWith(1688091377823895552)
})

it('single tweet can be retrieved successfully', async () => {
    const tweet = await Tweet.get('1674865731136020505')

    expect(tweet).toBeTruthy()
    expect(tweet).toBeDefined()
    assertType<TweetEmbed>(tweet)

    expect(tweet.id).toBeDefined()
    expect(tweet.createdAt).toBeDefined()
    expect(tweet.text).toBeDefined()
})

// describe('Tweet get', () => {
//     it.skip('', () => {

//     })
// })
