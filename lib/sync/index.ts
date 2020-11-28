import { Err, Ok, err, ok, Result } from '@dukeferdinand/ts-results'

export function clone<T>(data: T): T {
  if (typeof data === 'function') {
    throw new TypeError("[ Clone Error ] Cannot clone a function")
  }

  // Default, no deep clone
  return JSON.parse(JSON.stringify(data))
}

export function wrapped<T extends Function, E extends Error>(fn: T): () => Result<T, E> {
  return function (): Result<T, E> {
    try {
      return ok(fn(...arguments)) as Ok<T>
    } catch (e) {
      return err(e) as Err<E>
    }
  };
}
