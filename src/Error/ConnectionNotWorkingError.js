export default class ConnectionNotWorkingError extends Error {
    constructor(message = 'Connection not working.') {
        super(message)
        this.name = 'ConnectionNotWorkingError'
    }
}
