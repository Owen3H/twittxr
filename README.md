# twittxr
A simple wrapper library around the Twitter [Syndication API](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk?showReplies=true).<br>
Inspired by: https://github.com/zedeus/nitter/issues/919#issuecomment-1616703690

## About
The Syndication API is what is used by embedded widgets and its ease-of-use brings some notable limitations.<br>
**Twittxr** is best suited for setting up a user feed or getting a single tweet, it will not replace a fully fledged scraper/client.

#### ✅  Benefits
- Completely auth-free. (No login or tokens)
- Option to include retweets and/or replies.
- Requests are proxied via `corsproxy.io`. Can be overridden with [custom tweet options](#custom-tweet-options).
- Fast response times thanks to [Undici](https://github.com/nodejs/undici).
- Intuitive syntax and included types.

#### ❌ Drawbacks
- When getting a Timeline, only the latest 20 Tweets are returned.
- NSFW/Sensitive content requires passing your session `Cookie` string via the `options` param.

## Install
```bash
npm i twittxr
```

## Usage
> A UMD (browser/cjs) build is planned. For now, use [dynamic import](https://byby.dev/js-dynamic-imports).

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
