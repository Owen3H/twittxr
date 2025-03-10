import request from 'undici-shim'
import type { PuppeteerConfig, TwitterCookies } from './types.js'

import { FetchError, ParseError, HttpError, ConfigError } from './classes/errors.js'

const hasProp = (obj: unknown, name: string) =>
    Object.prototype.hasOwnProperty.call(obj, name)

const mockAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0'

const headers = (cookie?: string) => {
    const obj = {
        'User-Agent': mockAgent
    }

    if (cookie) obj['Cookie'] = cookie
    return obj
}

export const buildCookieString = (cookies: TwitterCookies) => {
    const entries = Object.entries(cookies)

    let str = "dnt=1; "
    for (const [k, v] of entries) {
        str += `${k}=${v}; `
    }

    return str.trimEnd()
}

/**
 * Sends a request to the API with a mock user agent, returning either the
 * response body or an {@link HttpError} including the status code.
 * @internal
 */
export async function sendReq(url: string, cookie?: string) {
    const res = await request(url, { headers: headers(cookie) })
    if (!res) throw new FetchError(`Received null/undefined fetching '${url}'`)

    const code = res.statusCode
    if (code !== 200 && code !== 304) {
        throw new HttpError(`Server responded with an error!\nStatus code: ${code}`, code)
    }

    // When running outside of Node, built-in fetch is used - therefore, 
    // fall back to original response since `body` won't be defined.
    return res.body ?? res
}

/**
 * Does the same as {@link sendReq} but grabs the page HTML response by
 * using Puppeteer to navigate to the API endpoint.
 * @internal
 */
export async function getPuppeteerContent(config: PuppeteerConfig & { 
    url: string,
    cookie?: string
}) {
    const { browser, cookie, url } = config
    let page = config?.page

    try {
        if (!page) {
            if (!browser) throw new ConfigError('Failed to use Puppeteer! Either `page` or `browser` need to be specified.') 
            page = await browser.newPage()
        }

        if (hasProp(page, 'setBypassCSP')) {
            await page.setBypassCSP(true)
        }

        if (hasProp(page, 'setExtraHTTPHeaders')) {
            await page.setExtraHTTPHeaders(headers(cookie))
        }
        
        await page.goto(url, { waitUntil: 'load' })
        return await page.content()
    }
    catch(e) { console.error(e) }
    finally {
        if (config.autoClose) await page.close()
    }
}

/**
 * Uses a {@link RegExp} pattern to extract the `__NEXT_DATA__` JSON
 * response from the inputted timeline HTML string.
 * @internal
 */
export const extractTimelineData = (html: string) => {
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

export const isNumeric = (str: string) => Number.isFinite(+str)