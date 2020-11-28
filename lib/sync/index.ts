import { err, ok, Result } from '@dukeferdinand/ts-results'

export function clone<T>(data: T): T {
  if (typeof data === 'function') {
    throw new TypeError("[ Clone Error ] Cannot clone a function")
  }

  // Default, no deep clone
  return JSON.parse(JSON.stringify(data))
}

export function wrapped<T, E extends Error, F extends Function>(fn: F): () => Result<T, E> {
  return function (): Result<T, E> {
    try {
      return ok<T>(fn(...arguments))
    } catch (e) {
      return err<E>(e)
    }
  };
}
