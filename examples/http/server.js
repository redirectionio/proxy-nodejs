import { createServer } from 'http'
import rio from '@redirectionio/proxy'
import url from 'url'

const port = 8002

// configure redirection.io with your own agent informations
const config = {
    real_agent: 'tcp://192.168.64.2:20301',
    fake_agent: 'tcp://localhost:3100',
    demo_agent: 'tcp://sdk_agent:8000',
}

const server = createServer(async (req, res) => {

    const redirect = await rio.handleHttpRequest(req, res, config)

    if (!redirect) {
        const path = url.parse(req.url).pathname

        if (path === '/') {
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.write('Demo App')
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.write('Oops! No page found.')
        }

        res.end()
    }
})

server.listen(port)

console.log(`Demo app listening on port ${port}!`)
