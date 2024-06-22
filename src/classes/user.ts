import type { RawUser } from "../types.js"

export default class User {
    readonly id: string
    readonly isBlueVerified: boolean
    readonly name: string
    readonly profileImageUrl: string
    readonly screenName: string
    readonly verified: boolean

    constructor(data: RawUser) {
        this.id = data.id_str
        this.isBlueVerified = data.is_blue_verified
        this.name = data.name
        this.profileImageUrl = data.profile_image_url_https
        this.screenName = data.screen_name
        this.verified = data.verified
    }
}

export {
    User
}