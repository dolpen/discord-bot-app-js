import {IOptionalLike} from './optionalLike'
import {Optional} from './optional'

export class Some<T> implements IOptionalLike<T> {
    private readonly value: T

    constructor(v: T) {
        this.value = v
    }

    public map<U>(apply: (src: T) => U): IOptionalLike<U> {
        return Optional<U>(apply(this.value!))
    }

    public flatMap<U>(apply: (src: T) => IOptionalLike<U>): IOptionalLike<U> {
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

    public toPromise(): Promise<T> {
        return Promise.resolve(this.value!)
    }
}
