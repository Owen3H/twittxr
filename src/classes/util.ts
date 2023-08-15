import { request } from 'undici'
import { FetchError, ParseError, HttpError } from './errors.js'

const puppeteer = require('puppeteer-extra')

const AdBlocker = require('puppeteer-extra-plugin-adblocker')
const Stealth = require('puppeteer-extra-plugin-stealth')

puppeteer.use(AdBlocker()).use(Stealth())

const mockAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0'

const headers = (cookie?: string) => {
    const obj = {
        'User-Agent': mockAgent
    }

    if (cookie) obj['Cookie'] = cookie
    return obj
}

/**
 * Sends a request to the API with a mock user agent, returning either the
 * response body or an {@link HttpError} including the status code.
 * @internal
 */
async function sendReq(url: string, cookie?: string) {
    const res = await request(url, { headers: headers(cookie) })

    if (!res) throw new FetchError(`Received null/undefined fetching '${url}'`)
    if (res.statusCode !== 200 && res.statusCode !== 304)
        throw new HttpError('Server responded with an error!', res.statusCode)

    return res.body
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPuppeteerContent(browser: any, url: string, cookie?: string) {
    const page = await browser.newPage()
    try {
        await page.setExtraHTTPHeaders(headers(cookie))
        await page.goto(url, { waitUntil: 'load' })

        return await page.content()
    }
    catch(e) {
        console.error(e)
    }
    finally {
        await page.close()
    }
}

/**
 * Uses a {@link RegExp} pattern to extract the `__NEXT_DATA__` JSON
 * response from the inputted timeline HTML string.
 * @internal
 */
const extractTimelineData = (html: string) => {
    const scriptId = `__NEXT_DATA__`
    const regex = new RegExp(`<script id="${scriptId}" type="application\/json">([^>]*)<\/script>`)

    try {
        const match = html.match(regex)
        if (match && match[1]) return match[1]
        
        throw new ParseError(`No match found for '${scriptId}'`)
    }
    catch (e) {
        console.error('Could not extract timeline data!\n' + e)
        return null
    }
}

export {
    sendReq, getPuppeteerContent,
    extractTimelineData
}