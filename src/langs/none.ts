import {IOptionalLike} from './optionalLike'

export class None<T> implements IOptionalLike<T> {

    public map<U>(apply: (src: T) => U): IOptionalLike<U> {
        return new None<U>()
    }

    public flatMap<U>(apply: (src: T) => IOptionalLike<U>): IOptionalLike<U> {
        return new None<U>()
    }

    public orElseGet(gen: () => T): T {
        return gen()
    }

    public orElse(def: T): T {
        return def
    }

    public toPromise(): Promise<T> {
        return Promise.reject()
    }
}
