export class Optional<T> {
    private readonly value: T | null

    constructor(v: T | null | undefined) {
        this.value = v === null || v === undefined ? null : v
    }

    public map<U>(apply: (src: T) => U): Optional<U> {
        const mapped = (this.value) ? apply(this.value) : null
        return new Optional(mapped)
    }

    public flatMap<U>(apply: (src: T) => Optional<U>): Optional<U> {
        return (this.value) ? apply(this.value) : new Optional<U>(null)
    }

    public orElseGet(gen: () => T): T {
        return (this.value) ? this.value : gen()
    }

    public orElse(def: T): T {
        return this.orElseGet(() => {
            return def
        })
    }

    public toPromise(): Promise<T> {
        if (this.value !== null) {
            return Promise.resolve(this.value)
        } else {
            return Promise.reject()
        }
    }
}
