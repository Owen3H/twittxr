# twittxr
A simple wrapper library around the Twitter [Syndication API](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk?showReplies=true).

## About
The Syndication API is what is used by embedded widgets, but has some significant limitations for trading ease-of-use. **Twittxr** is best suited for setting up a user feed or getting a single tweet.

Benefits
- Completely auth-free. (With optional session cookie for NSFW content)
- Requests are proxied through [corsproxy.io](https://corsproxy.io).
- Fast response times thanks to [Undici](https://github.com/nodejs/undici).
- Filter out retweets/replies.
- Intuitive syntax and included types.

Drawbacks
- When getting a Timeline, only the latest 20 Tweets are returned.
- This endpoint could be deprecated at any point and is subject to issues.

## Install
```bash
npm i twittxr
```

## Usage
> No CJS support yet, use dynamic import for now.

### ESM
#### Regular usage
```js
import { Timeline, Tweet } from 'twittxr'

// Replies and retweets filtered out by default.
const selfTweets = await Timeline.get('elonmusk')
console.log(selfTweets)

// Get a single tweet by its ID. (Not the same result as Timeline)
const tweet = await Tweet.get('1674865731136020505')
console.log(tweet)
```

#### Custom tweet options
```js
const custom = await Timeline.get('elonmusk', {
    replies: true,
    retweets: false,
    proxyUrl: 'https://example-proxy.com' // Optional, will override corsproxy.io
    cookie: 'yourCookieString' // Coming soon.
})

console.log(custom)
```
