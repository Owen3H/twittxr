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

#### ✅ Features
- Can include retweets and/or replies by the user.
- Option to pass cookie object or string to get **Sensitive/NSFW** Tweets.
- Ability to pass a [Puppeteer](https://pptr.dev) page, bypassing potential API auth issues.
- Fast response times thanks to [Undici](https://github.com/nodejs/undici).
- Intuitive syntax and included type definitions.

#### ❌ Limitations
- When getting a Timeline, only up to `100` Tweets can be returned. (May be `20` in some cases)
- NSFW/Sensitive content requires passing your session `Cookie` string via the `options` param.

## Installation
```sh
pnpm add twittxr
```
Optionally, you can install `puppeteer` >=16 to use as a fallback on failed requests.<br>
This will avoid issues with Cloudflare, e.g. "403 Forbidden".
```sh
pnpm add twittxr puppeteer
```

## Usage
```js
import { Timeline, Tweet } from 'twittxr' // ESM
const { Timeline, Tweet } = require('twittxr') // CommonJS
```

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
const tweetsWithRts = await Timeline.get('elonmusk', {
    cookie: 'yourCookieString', // Necessary for sensitive tweets to be included.
    replies: true, // This is the user's replies, not replies to their tweets.
    retweets: false
})
```

### Using Puppeteer
> **Note**
> By default, Puppeteer will be used as a fallback for failed requests - if installed.
> However, it is possible to solely use Puppeteer by calling `await usePuppeteer()`.

```js
import { Timeline } from 'twittxr'
```

<details>
  <summary>No config</summary>

```js
// Launches a basic headless browser & automatically closes the page.
await Timeline.usePuppeteer()
const tweets = await Timeline.get('elonmusk')
```
</details>

<details>
  <summary>With custom browser</summary>

```js
const puppeteer = require('puppeteer-extra')

// Use plugins if desired
puppeteer.use(ExamplePlugin())

const browser = await puppeteer.launch({ headless: true })

// Creates a new page and closes it automatically after every .get() call
await Timeline.usePuppeteer({ browser, autoClose: true })
const tweets = await Timeline.get('elonmusk')
```
</details>

<details>
  <summary>With page</summary>

```js
const puppeteer = require('puppeteer')
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

// Pass the page, but do not automatically close it.
await Timeline.usePuppeteer({ page, autoClose: false })
const tweets = await Timeline.get('elonmusk')

await page.goto('https://google.com') // Continue to manipulate the page.
await page.close() // Close the page manually.
```
</details>

To stop using Puppeteer at any point, you can simply call:
```js
Timeline.disablePuppeteer()
```