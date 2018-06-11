export default class Response {
    constructor(statusCode = 200, ruleId = null) {
        this.statusCode = statusCode
        this.ruleId = ruleId
    }
}
