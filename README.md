# Twittxr <img align="left" width="132" height="132" src="./icon.png">

A simple wrapper library around the Twitter/X Syndication API.<br>
Inspired by: https://github.com/zedeus/nitter/issues/919#issuecomment-1616703690

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3295160336cf41108ab4b409f6baf6c5)](https://app.codacy.com/gh/Owen3H/twittxr/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Build Status Badge](https://img.shields.io/github/actions/workflow/status/Owen3H/twittxr/main.yml)](https://github.com/Owen3H/twittxr/actions)
[![Discord](https://img.shields.io/discord/1215213004824645674?logo=discord&logoColor=white&color=blue)](https://discord.gg/64Vq7cpdGV)

## Overview
As you may know, Twitter/X ended free access to its API, making [IFTTT](https://ifttt.com) and other services obsolete for many users.
Instead, this wrapper aims to use the public facing [Syndication API](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk)
which is used by embedded widgets, though there are some notable limitations by using it as an "alternative".

**Twittxr** is best suited for setting up a user feed or getting a single tweet, it will not replace a fully fledged scraper/client.

#### ✅ Features
- Can include retweets and/or replies by the user.
- Option to pass cookie object or string to get **Sensitive/NSFW** Tweets.
- Ability to pass a [Puppeteer](https://pptr.dev) page, bypassing potential API auth issues.
- Works in and out of **Node** by using the fast `request` method from **Undici**, falling back to native `fetch` in the browser.
- Intuitive syntax and included type definitions.

#### ❌ Limitations
- When getting a Timeline, only up to `100` Tweets can be returned. (May be `20` in some cases)

## Authentication
Twitter is now known to require a cookie to return any data!<br>
I strongly advise you pass the `cookie` parameter in all of your requests.

***How do I get my session cookie?***
1. [Click here](https://syndication.twitter.com/srv/timeline-profile/screen-name/elonmusk) -> Right click -> **Inspect Element**
2. Refresh the page -> Select the **Network** tab -> Find the request with the `document` type.
3. Under **Request Headers**, locate the key named `Cookie` and copy the whole string.
4. Store this in an `.env` file like so:
  
    ```js
    TWITTER_COOKIE="yourCookieStringHere"
    ```

## Installation
```console
bun add twittxr
```

Optionally, you can install `puppeteer` >=16 to use as a fallback on failed requests.<br>
This can potentially avoid issues with Cloudflare. Ex: "403 Forbidden".

```console
bun add twittxr puppeteer
```

## Usage
```ts
import { Timeline, Tweet } from 'twittxr' // ESM
const { Timeline, Tweet } = require('twittxr') // CommonJS
```

### Get a single Tweet
```ts
// Does not return the same type as Timeline.get()
const tweet = await Tweet.get('1674865731136020505')
```

### Get a user Timeline
```ts
// The retweets and replies default to false.
const cookie = process.env.TWITTER_COOKIE
const timelineWithRts = await Timeline.get('elonmusk', { cookie }, { 
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
You **must** use this library at your own discretion!\
I will not be held accountable for any outcomes that may result from its usage, including and not limited to:
- Banning/Suspension of your Twitter/X account.
- Lawsuits, fines and other Twitter/X related legal disputes.
- Hacking of network and/or account when providing a proxy or exposing cookies.
