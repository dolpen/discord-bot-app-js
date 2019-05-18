import {None} from './none'
import {Some} from './some'

export type Optional<T> = Some<T> | None<T>

export const OptionalOf = <T>(value: T): Optional<T> => {
    if (value === null) {
        return new None()
    }
    if (value === undefined) {
        return new None()
    }
    return new Some(value!)
}
