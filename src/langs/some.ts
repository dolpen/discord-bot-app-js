import {IOptionalLike} from './optionalLike'
import {Optional, OptionalOf} from './optional'

export class Some<T> implements IOptionalLike<T> {
    private readonly value!: T

    constructor(v: T) {
        this.value = v
    }

    public map<U>(apply: (src: NonNullable<T>) => U): Optional<U> {
        return OptionalOf(apply(this.value!))
    }

    public flatMap<U>(apply: (src: NonNullable<T>) => Optional<U>): Optional<U> {
        return apply(this.value!)
    }

    public orElseGet(gen: () => T): T {
        return this.value!
    }

    public orElse(def: T): T {
        return this.orElseGet(() => {
            return def
        })
    }

    public toPromise(): Promise<NonNullable<T>> {
        return Promise.resolve(this.value!)
    }
}
