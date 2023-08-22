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
- Replies endpoint is currently broken and `replies: true` will not return anything.

## Authentication
Twitter is now known to require a cookie to return any data!<br>
I strongly advise you pass the `cookie` parameter in all of your requests.

***How do I get my session cookie?***
1. [Click here](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk) -> Right click -> Inspect Element
2. Under 'Network' find the request with the `document` type.
3. Find the header with the key `Cookie` and copy the whole string.
4. Store this in an `.env` file like so:
  
    ```js
    TWITTER_COOKIE="yourCookieStringHere"
    ```

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
```ts
// The retweets and replies default to false.
const timelineWithRts = await Timeline.get('elonmusk', { 
  cookie: process.env.TWITTER_COOKIE,
  retweets: true,
  replies: false, // This is the user's replies, not replies to their Tweets.
})
``` 

### Using Puppeteer
> **Note**
> By default, Puppeteer will be used as a fallback for failed requests - if installed.<br>
> However, it is possible to solely use Puppeteer by calling `await usePuppeteer()`.

```js
import { Timeline } from 'twittxr'
```

<details>
  <summary>No config</summary>

```js
// Launches a basic headless browser & automatically closes the page.
await Timeline.usePuppeteer()
const tweets = await Timeline.get('elonmusk', { 
  cookie: process.env.TWITTER_COOKIE
})
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
const tweets = await Timeline.get('elonmusk', { 
  cookie: process.env.TWITTER_COOKIE
})
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
const tweets = await Timeline.get('elonmusk', { 
  cookie: process.env.TWITTER_COOKIE
})

await page.goto('https://google.com') // Continue to manipulate the page.
await page.close() // Close the page manually.
```
</details>

To stop using Puppeteer at any point, you can simply call:
```js
Timeline.disablePuppeteer()
```

## Disclaimer
By using this library, you must do so at your own discretion.<br>
I will not be held accountable for any outcomes that may result from its usage, including and not limited to:
- Banning/Suspension of your Twitter account.
- Lawsuits, fines and other Twitter related legal disputes.
- Hacking of network and/or account when providing a proxy or exposing cookies.