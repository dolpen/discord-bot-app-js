import {Optional} from '../langs/optional'

export class Command {
    private readonly operation: string
    private readonly params: string[]

    constructor(prefix: string, content: string) {
        if (content.indexOf(prefix) !== 0) {
            this.operation = 'nop'
            this.params = []
        }
        const fragments = content.trim().substr(prefix.length).split(/[\s　]+/)
        if (fragments.length < 1) {
            this.operation = 'nop'
            this.params = []
        }
        this.operation = fragments[0]
        this.params = fragments.slice(1)
    }

    public getOperation(): string {
        return this.operation
    }

    public getParamLength(): number {
        return this.params.length
    }

    public getParam(index: number): Optional<string> {
        return new Optional(index >= this.params.length ? null : this.params[index])
    }
}
