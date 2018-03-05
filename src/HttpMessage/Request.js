export default class Request {
    constructor(host, path, userAgent, referer = '', scheme = 'http') {
        this.host = host
        this.path = path
        this.userAgent = userAgent
        this.referer = referer
        this.scheme = scheme
    }
}
