import { request } from 'undici-shim'
import { FetchError, ParseError, HttpError, ConfigError } from './errors.js'
import { PuppeteerConfig } from '../types.js'

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

    // When running outside of Node, built-in fetch is used - therefore, 
    // fallback to original response since `body` won't be defined.
    return res.body ?? res
}

async function getPuppeteerContent(config: PuppeteerConfig & { 
    url: string,
    cookie?: string
}) {
    const { browser, cookie, url } = config
    let page = config?.page

    try {
        if (!page) {
            if (browser) page = await browser.newPage()
            else throw new ConfigError('Failed to use Puppeteer! Either `page` or `browser` need to be specified.') 
        }

        await page.setExtraHTTPHeaders(headers(cookie))
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