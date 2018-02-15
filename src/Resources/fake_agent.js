/**
 * Examples of payload.
 *
 * GET.
 * Request: GET {"host": "host1.com", "request_uri": "/foo", "user_agent": "redirection-io-client/0.0.1", "referer": "http://host0.com", "use_json": true}
 * Response: {"status_code":301,"location":"/bar"}
 *
 * LOG.
 * Request: LOG {"status_code": 301, "host": "host1.com", "request_uri": "/foo", "user_agent": "redirection-io-client/0.0.1", "referer": "http://host0.com", "use_json": true}
 * Response: ok
 */

import { createServer } from 'net'

const matcher = process.env['RIO_RULES'] ? require(process.env['RIO_RULES']) : require('./fake_rules')

const ip = process.env['RIO_HOST'] ? process.env['RIO_HOST'] : 'localhost'
const port = process.env['RIO_PORT'] ? process.env['RIO_PORT'] : 3100

const server = createServer(connection => {
    connection
        .on('data', data => {
            let request = data.toString().trim().replace(/\n$/, '')
            const command = request.substring(0, request.indexOf(' '))
            
            try {
                request = JSON.parse(request.replace(command, ''))
            } catch (error) {
                console.log(`Unknown command: ${command}`)
                return
            }

            if (command === 'GET') {
                for (const redirection of matcher) {
                    if (redirection[0] === request['request_uri']) {
                        connection.write(
                            JSON.stringify({
                                status_code: redirection[2],
                                location: redirection[1]
                            })
                        )
                        return
                    }
                }
                connection.write(' ')
            } else if (command === 'LOG') {
                connection.write('1')
            } else {
                console.log(`Unknown command: ${command}`)
            }
        })
})

server.listen(port, () => { 
    console.log(`Fake agent started on tcp://${ip}:${port}`) 
})
