import {Message} from 'discord.js'
import {Command} from './models/command'

export class OperationHandler {

    private readonly handlers: { [key: string]: (message: Message, command: Command) => void; }

    constructor() {
        this.handlers = {}
    }

    public addHandler(name: string, func: (message: Message, command: Command) => void): void {
        this.handlers[name] = func
    }

    public invoke(message: Message, command: Command): void {
        const func = this.handlers[command.getOperation()]
        if (func) {
            func(message, command)
        }
    }
}
