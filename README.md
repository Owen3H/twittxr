<img align="right" src="https://cdn.discordapp.com/attachments/966369739679080578/1137401149901779004/Twittxr.png" width="150px"/>

# Twittxr
A simple wrapper library around the Twitter [Syndication API](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk?showReplies=true).<br>
Inspired by: https://github.com/zedeus/nitter/issues/919#issuecomment-1616703690

## About
The Syndication API is what is used by embedded widgets and its ease-of-use brings some notable limitations.<br>
**Twittxr** is best suited for setting up a user feed or getting a single tweet, it will not replace a fully fledged scraper/client.

#### ✅  Benefits
- Completely auth-free. (No login or tokens)
- Option to include retweets and/or replies.
- Requests are proxied via `corsproxy.io`. Can be overridden with [custom tweet options](#get-user-timeline).
- Fast response times thanks to [Undici](https://github.com/nodejs/undici).
- Intuitive syntax and included types.

#### ❌ Drawbacks
- When getting a Timeline, only the latest 20 Tweets are returned.
- NSFW/Sensitive content requires passing your session `Cookie` string via the `options` param.

## Install & Import
```bash
npm i twittxr
```

### ESM
```js
import { Timeline, Tweet } from 'twittxr'
```
### CJS
```js
const { Timeline, Tweet } = require('twittxr')
```

> **Note**
> Browser support is untested, but *should* work from v0.4.2

## Usage
### Get tweet by ID
```js
// Does not return the same type as Timeline.get()
const tweet = await Tweet.get('1674865731136020505')
```

### Get user timeline
```js
// Replies and retweets filtered out by default.
const tweets = await Timeline.get('elonmusk')
```

### Get user timeline (with options)
```js
const custom = await Timeline.get('elonmusk', {
    replies: true,
    retweets: false,
    proxyUrl: 'https://example-proxy.com' // Optional, will override corsproxy.io
    cookie: 'yourCookieString' // Coming soon.
})
```
