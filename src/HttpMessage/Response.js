export default class Response {
    constructor(statusCode = 200, ruleId = null, location = null) {
        this.statusCode = statusCode
        this.ruleId = ruleId
        this.location = location
    }
}
