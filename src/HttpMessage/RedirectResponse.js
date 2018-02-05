import Response from './Response'

export default class RedirectResponse extends Response {
    constructor(location, statusCode = 301) {
        super(statusCode)
        this.location = location
    }
}
