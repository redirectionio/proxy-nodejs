import Response from './Response'

export default class RedirectResponse extends Response {
    constructor(location, statusCode = 301, ruleId = null) {
        super(statusCode, ruleId)
        this.location = location
    }
}
