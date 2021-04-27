# redirection.io Proxy for Node.js

**[DEPRECATED]**: This library is deprecated and will not be maintained anymore.
It does not work with the [current version of the redirection.io
agent](https://redirection.io/documentation/developer-documentation/installation-of-the-agent),
but only with the legacy 1.x branch. We advise you to migrate and use [one of
the recommended
integrations](https://redirection.io/documentation/developer-documentation/available-integrations#recommended-integrations).

The redirection.io Proxy for Node.js works in combination with [redirection.io](https://redirection.io).

If you don't know what is redirection.io, take the time to make a quick tour on the website.

Before using it, you need:
- a redirection.io account. If you don't have an account, please [contact us here](https://redirection.io/contact-us).
- a configured redirection.io agent on your server. Please follow the [installation guide](https://redirection.io/documentation/developer-documentation/installation-of-the-agent).

Drop us an email to `support@redirection.io` if you need help or have any question.

## Requirements

- [Node.js Argon (4+)](https://nodejs.org)

## Installation

1. Require the module

```console
// with yarn
$ yarn add @redirectionio/proxy

// with npm
$ npm install --save @redirectionio/proxy
```

2. By default, redirection.io will try to reach an agent listening on `tcp://127.0.0.1:20301`.

3. If you need to configure redirection.io to use your personal agent informations, pass a dictionary of connections as last argument:
```js
const config = {
    agent_tcp: 'tcp://127.0.0.1:20301',
    agent_unix: 'unix:///var/run/redirectionio_agent.sock',
    // ...
}

// Express
rio.handleExpressRequest(app, config)

// Http
await rio.handleHttpRequest(req, res, config)
```

4. Then pick the usage that fit your needs (or write your own)

## Usages

### Pure `http`

```js
const http = require('http')
const rio = require('@redirectionio/proxy') // require the module

const port = YOUR_PORT

// don't forget to pass an async function here
const server = http.createServer(async (req, res) => {

    // wait here until we have a response from redirection.io
    const redirect = await rio.handleHttpRequest(req, res)

    if (!redirect) {
        // no redirection rule found, handle request here...
    }
})

server.listen(port)
```

### `express`

```js
const app = require('express')()
const rio = require('@redirectionio/proxy') // require the module

const port = YOUR_PORT

// put this line as top as possible
rio.handleExpressRequest(app)

// handle your app routes as usual...
app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use((req, res, next) => {
    res.status(404).send('Page not found.');
})

app.listen(port)
```

## Demonstration

### Available commands

- Start http demo server on `localhost:8002`
```console
$ yarn http
```

- Start express demo server on `localhost:8001`
```console
$ yarn express
```

- Start both express and http demo servers
```console
$ yarn start
```

- List server(s)
```console
$ yarn list
```

- Restart server(s)
```console
$ yarn restart
```

- Stop server(s)
```console
$ yarn stop
```

## Contribution

Any contribution is welcome :) Thanks.

### Install dev dependencies

```console
$ yarn install
```

### Run tests

```console
$ yarn test
```

### Run linter

```console
$ yarn lint
```

### Transpile babel code

```console
$ yarn build
```
