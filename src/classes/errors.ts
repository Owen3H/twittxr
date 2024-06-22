export class ConfigError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ConfigError'
    }
}

export class FetchError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FetchError'
    }
}

export class ParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ParseError'
    }
}

export class HttpError extends Error {
    code: number
    
    constructor(message: string, statusCode: number) {
        super(message)
        this.name = 'HttpError'
        this.code = statusCode
    }
}