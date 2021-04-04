import { err, ok, Result } from '@dukeferdinand/ts-results'


export function clone<T>(data: T): T {
  if (typeof data === 'function') {
    throw new TypeError("[ Clone Error ] Cannot clone a function yet")
  }

  // Default, deep clone via stringify
  return JSON.parse(JSON.stringify(data))
}

export function toString(data: unknown): string | undefined {
  if (typeof data === 'function') {
    throw new TypeError('[ ToString Error ] Cannot reliably stringify function')
  }

  return JSON.stringify(data)
}

export function wrapped<T, E extends Error, F extends (...args: unknown[]) => T>(fn: F): () => Result<T, E> {
  return function (...args: unknown[]): Result<T, E> {
    try {
      return ok<T>(fn(...args))
    } catch (e) {
      return err<E>(e)
    }
  };
}

