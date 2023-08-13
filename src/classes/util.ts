import { request } from 'undici'
import { FetchError, ParseError, HttpError } from './errors.js'

const mockAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0'

const headers = (cookie?: string) => {
    const obj = {
        'User-Agent': mockAgent
    }

    if (cookie) obj['Cookie'] = cookie
    return { headers: obj }
}

/**
 * Sends a request to the API with a mock user agent, returning either the
 * response body or an {@link HttpError} including the status code.
 * @internal
 */
async function sendReq(url: string, cookie?: string) {
    const res = await request(url, headers(cookie))

    if (!res) throw new FetchError(`Received null/undefined fetching '${url}'`)
    if (res.statusCode !== 200 && res.statusCode !== 304)
        throw new HttpError('Server responded with an error!', res.statusCode)

    return res.body
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
    sendReq,
    extractTimelineData,
    FetchError,
    HttpError
}