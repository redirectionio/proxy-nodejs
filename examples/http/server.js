import { createServer } from 'http'
import rio from '@redirectionio/proxy'
import url from 'url'

const port = 8002

// configure redirection.io with your own agent informations
const config = [
    {
        'name': 'real_agent',
        'host': '192.168.64.2',
        'port': 20301
    },
    {
        'name': 'fake_agent',
        'host': 'localhost',
        'port': 3100
    },
    {
        'name': 'demo_agent',
        'host': 'sdk_agent',
        'port': 8000,
    }
]

const server = createServer(async (req, res) => {

    const redirect = await rio.handleHttpRequest(req, res, config)

    if (!redirect) {
        const path = url.parse(req.url).pathname

        if (path === '/') {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write('Demo App')
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'})
            res.write('Oops! No page found.')
        }

        res.end()
    }
})

server.listen(port)

console.log(`Demo app listening on port ${port}!`)
