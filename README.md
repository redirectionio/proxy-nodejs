# redirection.io Node Module

redirection.io module works in combination with [redirection.io](https://redirection.io).

If you don't know what is redirection.io, take the time to make a quick tour on the website.

Before using it, you need:
- a redirection.io account
- a configured redirection.io agent on your server

You don't have an account ? Please create one [here](https://redirection.io).
You don't have an installed and configured agent ? Follow the [installation guide](https://redirection.io).

Drop us an email to `coucou@redirection.io` if you need help or have any question.

## Requirements

- [Node.js Argon (4+)](https://nodejs.org)

## Installation

1. Require the module

```console
// with yarn
$ yarn add redirectionio

// with npm
$ npm install --save redirectionio
```

2. By default, redirection.io will try to reach an agent listening on `127.0.0.1:20301`.
```js
connections: [
    {
        'name': 'default',
        'host': '127.0.0.1',
        'port': 20301
    }
]
```

3. If you need to configure redirection.io to use your personal agent informations, pass an array of connections as last argument:
```js
const config = [
    {
        'name': 'real_agent',
        'host': '192.168.64.2',
        'port': 20301
    },
    // ...
]

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
const rio = require('redirectionio') // require the module

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
const rio = require('redirectionio') // require the module

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

- Start http demo server on `localhost:8003`
```console
$ npm run http
```
    
- Start express demo server on `localhost:8004`
```console
$ npm run express
```

- Start both express and http demo servers
```console
$ npm run start
```

- List server(s)
```console
$ npm run list
```

- Restart server(s)
```console
$ npm run restart
```

- Stop server(s)
```console
$ npm run stop
```

## Contribution

Any contribution is welcome :) Thanks.

### Install dev dependencies

```console
$ npm install
```

### Run tests

```console
$ npm test
```

### Run linter

```console
$ npm run lint
```

### Transpile babel code

```console
$ npm run build
```
