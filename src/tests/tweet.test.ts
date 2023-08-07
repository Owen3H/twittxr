/* eslint-disable no-undef */
import { Tweet } from '../classes/tweet.js'

test.skip('single tweet is of correct type', () => {

})

test('single tweet can be retrieved successfully', async () => {
    const tweet = await Tweet.get('1674865731136020505')

    expect(tweet).toBeDefined()
    expect(tweet.user).toBeDefined()
})

