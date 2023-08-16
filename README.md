<div align="left">
  <a href="https://twitter.com/elonmusk/status/1685096284275802112">
    <img align="left" src="https://cdn.discordapp.com/attachments/966369739679080578/1137401149901779004/Twittxr.png" width="120">
  </a>
  <h2>Twittxr</h2>
</div>

A simple wrapper library around the Twitter Syndication API.<br>
Inspired by: https://github.com/zedeus/nitter/issues/919#issuecomment-1616703690

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3295160336cf41108ab4b409f6baf6c5)](https://app.codacy.com/gh/Owen3H/twittxr/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![node-current](https://img.shields.io/node/v/twittxr)

## About
The [Syndication API](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk) is what is used by embedded widgets and its ease-of-use brings some notable limitations.
<br> **Twittxr** is best suited for setting up a user feed or getting a single tweet, it will not replace a fully fledged scraper/client.

#### ✅ Benefits
- Completely auth-free, no tokens or login required.
- Powered by [puppeteer-extra](https://github.com/berstend/puppeteer-extra). (With `Stealth` and `AdBlocker` plugins)
- Option to include retweets and/or replies.
- Option to pass a cookie string, **required for NSFW tweets to be included**.
- Fast response times thanks to [Undici](https://github.com/nodejs/undici).
- Intuitive syntax and included types.

#### ❌ Drawbacks
- When getting a Timeline, only up to `100` Tweets can be returned. (May be `20` in some cases)
- NSFW/Sensitive content requires passing your session `Cookie` string via the `options` param.

## Install & Import
```sh
pnpm add twittxr
```

```js
import { Timeline, Tweet } from 'twittxr' // ESM
const { Timeline, Tweet } = require('twittxr') // CommonJS
```

## Usage
### Get a single Tweet
```js
// Does not return the same type as Timeline.get()
const tweet = await Tweet.get('1674865731136020505')
```

### Get a user Timeline
```js
// Replies and retweets filtered out by default.
const tweets = await Timeline.get('elonmusk')

// You can pass certain options to override the default behaviour.
const tweets = await Timeline.get('elonmusk', {
    replies: true,
    retweets: false,
    proxyUrl: 'https://corsproxy.io?', // Example proxy
    cookie: 'yourCookieString' // Necessary for sensitive tweets to be included.
})
```
