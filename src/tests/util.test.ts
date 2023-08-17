import { buildCookieString } from '../classes/util.js'

import { 
    it, describe, expect
} from 'vitest'

describe('util', () => {
    it('can build a cookie string', () => {
        const cookieStr = buildCookieString({
            kdt: "pojfew0-21-4e2nj3n",
            ct0: "99j2m2r3r-mkdmfngiregiu453272bnbsax-0zc34m2",
            auth_token: "somesupersecrettoken",
            guest_id: "?????q]fwef2f-0efd"
        })

        expect(cookieStr).toBeDefined()
        expect(cookieStr).toBeTypeOf("string")
    })
})