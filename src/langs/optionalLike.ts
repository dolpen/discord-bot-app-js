export interface IOptionalLike<T> {
    map<U>(apply: (src: T) => U): IOptionalLike<U>

    flatMap<U>(apply: (src: T) => IOptionalLike<U>): IOptionalLike<U>

    orElse(def: T): T

    orElseGet(gen: () => T): T

    toPromise(): Promise<T>
}
