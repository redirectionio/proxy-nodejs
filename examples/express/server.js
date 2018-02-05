import express from 'express'
import rio from 'redirectionio'

const app = express()
const port = 8004

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
    }
]

rio.handleExpressRequest(app, config)

app.get('/', (req, res) => {
    res.send('Demo App')
})

app.use((req, res) => {
    res.status(404).send('Oops! No page found.')
})

app.listen(port, () => {
    console.log(`Demo app listening on port ${port}!`)
})
