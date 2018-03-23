/*
If you want to add a Logger, please extends this class and use methods defined within
Each method expects exactly two arguments:
    message | type: string
    context | type: object
*/

export default class AbstractLogger {
    debug() {}
    warn() {}
    error() {}
    info() {}
}
