import express from 'express'
import rio from '@redirectionio/proxy'

const app = express()
const port = 8001

// configure redirection.io with your own agent informations
const config = {
    real_agent: 'tcp://192.168.64.2:20301',
    fake_agent: 'tcp://localhost:3100',
    demo_agent: 'tcp://sdk_agent:8000',
}

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
