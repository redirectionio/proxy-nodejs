import Client from './Client'
import Request from './HttpMessage/Request'
import Response from './HttpMessage/Response'

export default class RedirectionIO {
    static connections = { default: 'tcp://127.0.0.1:20301' }

    /**
     * @param express.app app
     */
    static handleExpressRequest(app, connections = null) {
        if (connections !== null) {
            this.connections = connections
        }

        app.use(async (req, res, next) => {
            const request = new Request(req.get('Host'), req.originalUrl, req.get('User-Agent'), req.get('Referer'), req.protocol)
            const response = await this.handleRequest(request)

            req.rio = { request: request, response: response }
            this.attachLogEvent(req, res)

            if (!response) {
                return next()
            }

            response.statusCode === 410
                ? res.status(410).send()
                : res.redirect(response.statusCode, response.location)
        })
    }

    /**
     * @param http.IncomingMessage req
     * @param http.IncomingMessage res
     */
    static async handleHttpRequest(req, res, connections = null) {
        if (connections !== null) {
            this.connections = connections
        }

        const scheme = req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : 'http'
        const request = new Request(req.headers['host'], req.url.split('?')[0], req.headers['user-agent'], scheme)
        const response = await this.handleRequest(request)

        req.rio = { request: request, response: response }
        this.attachLogEvent(req, res)

        if (!response) {
            return false
        }

        response.statusCode === 410
            ? res.writeHead(410)
            : res.writeHead(response.statusCode, { Location: response.location })

        res.end()
        return true
    }

    /**
     * Check if a redirection rule exists for a given `request`.
     *
     * @param redirectionio.Request request
     */
    static async handleRequest(request, connections = null) {
        if (connections !== null) {
            this.connections = connections
        }

        const client = new Client(this.connections, 10, false)

        let response = null

        response = await client.findRedirect(request)

        return response
    }

    /**
     * Log a request/response couple.
     *
     * @param http.IncomingMessage req
     * @param http.ServerResponse res
     */
    static attachLogEvent(req, res) {
        req.on('end', async () => {
            const request = req.rio.request
            const response = req.rio.response || new Response(res.statusCode)
            const client = new Client(this.connections, 10, false)

            await client.log(request, response)
        })
    }
}
