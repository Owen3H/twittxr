class FetchError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FetchError'
    }
}

class ParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ParseError'
    }
}

class HttpError extends Error {
    code: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.name = 'HttpError'
        this.code = statusCode
    }
}

export {
    FetchError,
    ParseError,
    HttpError
}