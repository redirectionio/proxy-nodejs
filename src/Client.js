import { connect } from 'net'

import AgentNotFoundError from './Error/AgentNotFoundError'
import BadConfigurationError from './Error/BadConfigurationError'
import ConnectionNotWorkingError from './Error/ConnectionNotWorkingError'
import NullLogger from './Logger/NullLogger'
import RedirectResponse from './HttpMessage/RedirectResponse'
import Response from './HttpMessage/Response'

export default class Client {
    /**
     * @param array connections
     * @param int timeout
     * @param bool debug
     * @param redirectionio.AbstractLogger logger
     */
    constructor(connections, timeout = 10, debug = false, logger = null) {
        if (!Array.isArray(connections)) {
            throw new BadConfigurationError('`connections` should be an array.')
        }

        if (!connections.length) {
            throw new BadConfigurationError('At least one connection is required.')
        }

        this.connections = []

        for (const connection of connections) {
            this.connections[connection.name] = this.resolveConnection(connection)
        }

        this.timeout = timeout
        this.debug = debug
        this.logger = logger ? logger : new NullLogger()
    }

    resolveConnection(connection) {
        if (!connection.hasOwnProperty('name') || !connection.hasOwnProperty('host') || !connection.hasOwnProperty('port')) {
            throw new BadConfigurationError('A connection should have `name`, `host` and `port` properties.')
        }

        connection.retries = 2

        return connection
    }

    /**
     * @param redirectionio.Request request
     */
    async findRedirect(request) {
        const context = {
            'host': request.host,
            'request_uri': request.path,
            'user_agent': request.userAgent,
            'referer': request.referer,
            'scheme': request.scheme,
            'use_json': true
        }

        let response = null

        try {
            response = await this.request('GET', context)
        } catch (error) {
            if (this.debug) {
                throw error
            }

            return
        }

        if (!response) {
            return
        }

        response = JSON.parse(response)

        return response.status_code == 410
            ? new Response(410)
            : new RedirectResponse(response.location, Number(response.status_code))
    }

    /**
     * @param redirectionio.Request request
     * @param redirectionio.Response response
     */
    async log(request, response) {
        const context = {
            'status_code': response.statusCode,
            'host': request.host,
            'request_uri': request.path,
            'user_agent': request.userAgent,
            'referer': request.referer,
            'scheme': request.scheme,
            'use_json': true
        }

        try {
            return await this.request('LOG', context) == true
        } catch (error) {
            if (this.debug) {
                throw error
            }

            return
        }
    }

    /**
     * @param string command
     * @param object context
     */
    async request(command, context) {
        const content = command + ' ' + JSON.stringify(context) + '\n'

        let socket = null

        try {
            socket = await this.getConnection()
        } catch (error) {
            throw error
        }

        let response = null

        // `removeAllListeners` needed to avoid `MaxListenersExceededWarning` warning on socket `data` and `error` event
        // prevent listeners to be added recursively in doSend/doGet methods if one fails
        socket.removeAllListeners('data').removeAllListeners('error')

        try {
            await this.doSend(socket, content)
            response = await this.doGet(socket)
        } catch (error) {
            this.logger.debug('Impossible to send/get data with this connection', {
                'connection': this.connections[this.currentConnectionName]
            })

            --this.connections[this.currentConnectionName].retries
            this.currentConnection = null
            return this.request(command, context)
        }

        return response.trim()
    }

    async getConnection() {
        if (this.currentConnection) {
            return this.currentConnection
        }

        for (const connectionName in this.connections) {
            const connection = this.connections[connectionName]

            if (connection.retries <= 0) {
                continue
            }

            this.logger.debug('New connection chosen. Trying to connect.', {
                'connection': connection,
                'name': connectionName
            })

            let socket = null

            try {
                socket = await this.doConnect(connection)
            } catch (error) {
                this.logger.debug('Impossible to connect to the connection.', {
                    'connection': connection,
                    'name': connectionName
                })

                connection.retries = 0
                continue
            }

            this.logger.debug('New connection approved.', {
                'connection': connection,
                'name': connectionName
            })

            socket.setTimeout(this.timeout)

            this.currentConnection = socket
            this.currentConnectionName = connection.name

            return socket
        }

        this.logger.error('Can not find an agent.', {
            'connections': this.connections
        })

        throw new AgentNotFoundError()
    }

    /**
     * @param string connection
     */
    doConnect(connection) {
        return new Promise((resolve, reject) => {
            const socket = connect(connection.port, connection.host)

            socket
                .on('connect', () => resolve(socket))
                .on('error', error => reject(new ConnectionNotWorkingError(error.message)))
                .on('timeout', () => socket.end())
        })
    }

    /**
     * @param net.Socket socket
     * @param string content
     */
    doSend(socket, content) {
        return new Promise((resolve, reject) => {
            try {
                socket.write(content, () => resolve())
            } catch (error) {
                reject(new ConnectionNotWorkingError(error.message))
            }
        })
    }

    /**
     * @param net.Socket socket
     */
    doGet(socket) {
        return new Promise((resolve, reject) => {
            socket
                .on('data', data => resolve(data.toString()))
                .on('error', error => reject(new ConnectionNotWorkingError(error.message)))
        })
    }
}
