export default class AgentNotFoundError extends Error {
    constructor(message = 'Can not find an agent.') {
        super(message)
        this.name = 'AgentNotFoundError'
    }
}
