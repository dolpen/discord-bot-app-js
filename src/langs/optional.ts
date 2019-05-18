import {None} from './none'
import {Some} from './some'

type Optional<T> = Some<T> | None<T>

export const Optional = <T>(value: T): Optional<T> => {
    if (value === null) {
        return new None()
    }
    if (value === undefined) {
        return new None()
    }
    return new Some(value!)
}
