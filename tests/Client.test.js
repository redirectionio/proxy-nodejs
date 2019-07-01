import { spawn } from 'child_process'

import AgentNotFoundError from '../src/Error/AgentNotFoundError'
import BadConfigurationError from '../src/Error/BadConfigurationError'
import Client from '../src/Client'
import Request from '../src/HttpMessage/Request'
import Response from '../src/HttpMessage/Response'

let agent = null
let client = null

beforeAll(done => {
    agent = spawn('node', ['-r', 'esm', __dirname + '/../src/Resources/fake_agent.js'], { detached: true })
    agent.stdout.on('data', () => done())

    client = new Client({ 'fake_agent': 'tcp://localhost:3100' })
})

afterAll(() => {
    try {
        process.kill(-agent.pid)
    } catch (error) {
        // Fake agent already stopped
    }
})

it('find redirect when rule exist', async () => {
    const request = createRequest({ path: '/foo' })
    const response = await client.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(301)
    expect(response.location).toBe('/bar')
})

it('find redirect with query params when rule exist', async () => {
    const request = createRequest({ path: '/foo?with=some&query=params' })
    const response = await client.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(301)

    expect(response.location).toBe('/bar?with=some&query=params')
})

it('send 410 response when rule exist', async () => {
    const request = createRequest({ path: '/garply' })
    const response = await client.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(410)
})

it('find twice redirect when rule exist', async () => {
    const request = createRequest({ path: '/foo' })
    let response = await client.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(301)
    expect(response.location).toBe('/bar')

    response = await client.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(301)
    expect(response.location).toBe('/bar')
})

it('find nothing when rule not exist', async () => {
    const request = createRequest({ path: '/hello' })
    const response = await client.findRedirect(request)

    expect(response).toBeFalsy()
})

it('find nothing when agent is down', async () => {
    const brokenClient = new Client({ 'broken_agent': 'tcp://unknown-host:80' })
    const request = createRequest()
    const response = await brokenClient.findRedirect(request)

    expect(response).toBeFalsy()
})

it('fail when agent is down and debug enabled', async () => {
    const brokenClient = new Client({ 'broken_agent': 'tcp://unknown-host:80' }, 10, true)
    const request = createRequest()

    await expect(brokenClient.findRedirect(request)).rejects.toThrow(AgentNotFoundError.message)
})

it('log redirection', async () => {
    const request = createRequest()
    const response = new Response()

    await expect(client.log(request, response)).resolves.toBeTruthy()
})

it('log nothing when agent is down', async () => {
    const brokenClient = new Client({ 'broken_agent': 'tcp://unknown-host:80' })
    const request = createRequest()
    const response = new Response()

    await expect(brokenClient.log(request, response)).resolves.toBeFalsy()
})

it('fail logging when agent is down and debug enabled', async () => {
    const brokenClient = new Client({ 'broken_agent': 'tcp://unknown-host:80' }, 10, true)
    const request = createRequest()
    const response = new Response()

    await expect(brokenClient.log(request, response)).rejects.toThrow(AgentNotFoundError.message)
})

it('find redirect in multiple hosts array', async () => {
    const customClient = new Client({
        'broken_agent_1': 'tcp://unknown-host:80',
        'broken_agent_2': 'tcp://unknown-host:81',
        'fake_agent': 'tcp://localhost:3100',
    })
    const request = createRequest({ path: '/foo' })
    const response = await customClient.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(301)
    expect(response.location).toBe('/bar')
})

it('find nothing when agent goes down', async () => {
    let customAgent = null

    await (() => {
        return new Promise(resolve => {
            const env = Object.create(process.env)
            env.RIO_PORT = 3101
            customAgent = spawn('node', ['-r', 'esm', __dirname + '/../src/Resources/fake_agent.js'], { env: env, detached: true })
            customAgent.stdout.on('data', () => resolve())
            customAgent.stderr.on('data', data => console.log(data.toString()))
        })
    })()

    const customClient = new Client({
        'broken_agent_1': 'tcp://unknown-host:80',
        'broken_agent_2': 'tcp://unknown-host:81',
        'fake_agent': 'tcp://localhost:3101',
    })

    const request = createRequest({ path: '/foo' })
    let response = await customClient.findRedirect(request)

    expect(response).toBeInstanceOf(Response)
    expect(response.statusCode).toBe(301)
    expect(response.location).toBe('/bar')

    try {
        process.kill(-customAgent.pid)
    } catch (error) {
        // Fake agent already stopped
    }

    await expect(customClient.findRedirect(request)).resolves.toBeFalsy()
})

it('cannot allow instantiation with empty connections options', async () => {
    expect(() => new Client([])).toThrow(BadConfigurationError.message)
})

it('cannot allow instantiation with missing connection option properties', async () => {
    expect(() => new Client([{}])).toThrow(BadConfigurationError.message)
})

function createRequest(options = {}) {
    const host = options.hasOwnProperty('host') ? options.host : 'host1.com'
    const path = options.hasOwnProperty('path') ? options.path : ''
    const userAgent = options.hasOwnProperty('userAgent') ? options.userAgent : 'redirection-io-client/0.0.1'
    const referer = options.hasOwnProperty('referer') ? options.referer : 'host0.com'

    return new Request(host, path, userAgent, referer)
}
