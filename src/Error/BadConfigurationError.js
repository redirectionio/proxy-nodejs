export default class BadConfigurationError extends Error {
    constructor(message = 'Bad configuration.') {
        super(message)
        this.name = 'BadConfigurationError'
    }
}
