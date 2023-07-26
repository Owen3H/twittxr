import { request } from 'undici'

const extractJSONData = html => {
    const regex = new RegExp('<script id="__NEXT_DATA__" type="application\/json">([^>]*)<\/script>')
    const match = html.match(regex)
  
    if (match && match[1]) 
      return match[1]
    
    return null
}

async function fetchData(url) {
    try {
        const res = await request(url, { headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0'
        }}).catch(console.log)

        if (!res) throw new Error('Invalid response from ' + url)
        if (res.statusCode !== 200 && res.statusCode !== 304) 
            throw new Error('Could not fetch ' + url)

        const html = await res.body.text()
        const jsonStr = extractJSONData(html)

        if (!jsonStr) throw new Error('Script tag not found or JSON data missing.')
        return JSON.parse(jsonStr)
    } catch (e) {
        console.error(e)
    }
}

export {
    fetchData,
    extractJSONData
}