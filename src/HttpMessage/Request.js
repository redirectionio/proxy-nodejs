export default class Request {
    constructor(host, path, userAgent, referer = '') {
        this.host = host
        this.path = path
        this.userAgent = userAgent
        this.referer = referer
    }
}
