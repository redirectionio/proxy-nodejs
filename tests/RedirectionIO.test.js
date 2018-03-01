import { spawn } from 'child_process'

import RedirectionIO from '../src/RedirectionIO'
import Request from '../src/HttpMessage/Request'

let agent = null
const config = [{'name': 'fake_agent', 'host': '127.0.0.1', 'port': 3200}]

beforeAll(done => {
    const env = Object.create(process.env)
    env.RIO_PORT = 3200
    agent = spawn('./node_modules/.bin/babel-node', [__dirname + '/../src/Resources/fake_agent.js'], {env: env, detached: true})
    agent.stdout.on('data', () => done())
})

afterAll(() => process.kill(-agent.pid))

it('find redirect in express server when rule exist', done => {
    // Mocks all needed functions/objects
    const next = jest.fn()
    const redirect = jest.fn()

    const app = {
        async use() {
            const req = createRequest({path: '/foo'})
            const res = { redirect(statusCode, location) { redirect(statusCode, location) }}
            
            const request = new Request(req.get('Host'), req.originalUrl, req.get('User-Agent'), req.get('Referer'))
            const response = await RedirectionIO.handleRequest(request, config)
            
            if (response) {
                res.redirect(response.statusCode, response.location)
            } else {
                next()
            }
            playTests()
        }
    }

    // Run redirection.io
    RedirectionIO.handleExpressRequest(app, config)

    // Play tests
    function playTests() {
        expect(redirect.mock.calls.length).toBe(1)
        expect(redirect.mock.calls[0][0]).toBe(301)
        expect(redirect.mock.calls[0][1]).toBe('/bar')
        expect(next.mock.calls.length).toBe(0)

        done()
    }
})

it('find nothing in express server when rule not exist', done => {
    // Mocks all needed functions/objects
    const next = jest.fn()
    const redirect = jest.fn()

    const app = {
        async use() {
            const req = createRequest({path: '/hello'})
            const res = { redirect(statusCode, location) { redirect(statusCode, location) }}
            
            const request = new Request(req.get('Host'), req.originalUrl, req.get('User-Agent'), req.get('Referer'))
            const response = await RedirectionIO.handleRequest(request, config)
            
            if (response) {
                res.redirect(response.statusCode, response.location)
            } else {
                next()
            }
            playTests()
        }
    }

    // Run redirection.io
    RedirectionIO.handleExpressRequest(app, config)

    // Play tests
    function playTests() {
        expect(redirect.mock.calls.length).toBe(0)
        expect(next.mock.calls.length).toBe(1)

        done()
    }
})

it('find redirect in http server when rule exist', async () => {
    const writeHead = jest.fn()

    const req = createRequest({path: '/foo'})
    const res = { 
        writeHead(statusCode, location) { 
            writeHead(statusCode, location) 
        },
        end() {}
    }
    
    await expect(RedirectionIO.handleHttpRequest(req, res, config)).resolves.toBeTruthy()
})

it('find nothing in http server when rule not exist', async () => {
    const writeHead = jest.fn()

    const req = createRequest({path: '/hello'})
    const res = { 
        writeHead(statusCode, location) { 
            writeHead(statusCode, location) 
        },
        end() {}
    }
    
    await expect(RedirectionIO.handleHttpRequest(req, res, config)).resolves.toBeFalsy()
})

// Warning: Should be the last tests because they kill the fake_agent
it('find nothing in express server when agent is down', done => {
    try { 
        process.kill(-agent.pid) 
    } catch (error) {
        // do nothing
    }

    // Mocks all needed functions/objects
    const next = jest.fn()
    const redirect = jest.fn()

    const app = {
        async use() {
            const req = createRequest({path: '/foo'})
            const res = { redirect(statusCode, location) { redirect(statusCode, location) }}
            
            const request = new Request(req.get('Host'), req.originalUrl, req.get('User-Agent'), req.get('Referer'))
            const response = await RedirectionIO.handleRequest(request, config)
            
            if (response) {
                res.redirect(response.statusCode, response.location)
            } else {
                next()
            }
            playTests()
        }
    }

    // Run redirection.io
    RedirectionIO.handleExpressRequest(app, config)

    // Play tests
    function playTests() {
        expect(redirect.mock.calls.length).toBe(0)
        expect(next.mock.calls.length).toBe(1)

        done()
    }
})

// Warning: Should be the last tests because they kill the fake_agent
it('find nothing in express server when agent is down', async () => {
    try { 
        process.kill(-agent.pid) 
    } catch (error) {
        // do nothing
    }

    const writeHead = jest.fn()

    const req = createRequest({path: '/foo'})
    const res = { 
        writeHead(statusCode, location) { 
            writeHead(statusCode, location) 
        },
        end() {}
    }
    
    await expect(RedirectionIO.handleHttpRequest(req, res, config)).resolves.toBeFalsy()
})

function createRequest(options = {}) {  
    const host = options.hasOwnProperty('host') ? options.host : 'host1.com'
    const path = options.hasOwnProperty('path') ? options.path : ''
    const userAgent = options.hasOwnProperty('userAgent') ? options.userAgent : 'redirection-io-client/0.0.1'
    const referer = options.hasOwnProperty('referer') ? options.referer : 'host0.com'
    
    return {
        originalUrl: path,
        url: path,
        headers: {
            'host': host,
            'user-agent': userAgent,
            'referer': referer
        },
        get(header) {
            return this.headers[header.toLowerCase()]
        },
        on() {}
    }
}
