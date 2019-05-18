import {Optional} from './optional'

export interface IOptionalLike<T> {
    map<U>(apply: (src: NonNullable<T>) => U): Optional<U>

    flatMap<U>(apply: (src: NonNullable<T>) => Optional<U>): Optional<U>

    orElse(def: T): T

    orElseGet(gen: () => T): T

    toPromise(): Promise<NonNullable<T>>
}
