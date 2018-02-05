import AbstractLogger from './AbstractLogger'

export default class NullLogger extends AbstractLogger {
    debug() {}
    warn() {}
    error() {}
    info() {}
}
