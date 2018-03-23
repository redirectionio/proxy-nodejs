import Client from './Client'
import Request from './HttpMessage/Request'
import Response from './HttpMessage/Response'

export default class RedirectionIO {
    static connections = [
        {
            'name': 'default',
            'host': '127.0.0.1',
            'port': 20301
        }
    ]

    /**
     * @param express.app app
     */
    static handleExpressRequest(app, connections = null) {
        if (connections !== null) {
            this.connections = connections
        }

        app.use(async (req, res, next) => {
            this.attachLogEvent(req, res)

            const request = new Request(req.get('Host'), req.originalUrl, req.get('User-Agent'), req.get('Referer'), req.protocol)
            const response = await this.handleRequest(request)

            if (!response) return next()

            response.statusCode == 410
                ? res.sendStatus(410)
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

        this.attachLogEvent(req, res)

        const scheme = req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : 'http'
        const request = new Request(req.headers['host'], req.url.split('?')[0], req.headers['user-agent'], scheme)
        const response = await this.handleRequest(request)

        if (!response) return false

        response.statusCode == 410
            ? res.writeHead(410)
            : res.writeHead(response.statusCode, {Location: response.location})

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

        try {
            response = await client.findRedirect(request)
        } catch (error) {
            throw error
        }

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
            const path = req.originalUrl ? req.originalUrl : req.url.split('?')[0]
            const scheme = req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : 'http'
            const request = new Request(req.headers['host'], path, req.headers['user-agent'], req.headers['referer'], scheme)
            const response = new Response(res.statusCode)
            const client = new Client(this.connections, 10, false)

            try {
                await client.log(request, response)
            } catch (error) {
                throw error
            }
        })
    }
}
