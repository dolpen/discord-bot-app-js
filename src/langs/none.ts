import {IOptionalLike} from './optionalLike'
import {Optional} from './optional'

export class None<T> implements IOptionalLike<T> {

    public map<U>(apply: (src: NonNullable<T>) => U): Optional<U> {
        return new None<U>()
    }

    public flatMap<U>(apply: (src: NonNullable<T>) => Optional<U>): Optional<U> {
        return new None<U>()
    }

    public orElseGet(gen: () => T): T {
        return gen()
    }

    public orElse(def: T): T {
        return def
    }

    public toPromise(): Promise<NonNullable<T>> {
        return Promise.reject()
    }
}
