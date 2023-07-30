import { RawUser } from "src/types.js"

export default class User {
    id: string;
    isBlueVerified: boolean;
    name: string;
    profileImageUrl: string;
    screenName: string;
    verified: boolean;

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