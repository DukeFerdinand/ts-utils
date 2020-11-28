import { err, ok, Err, Ok, Result } from '@dukeferdinand/ts-results'

export function asyncWrapped<T extends Function, E extends Error>(fn: T): () => Promise<Result<T, E>> {
  return async function (...args): Promise<Result<T, E>> {
    try {
      const res = await fn(...args)
      return ok(res) as Ok<T>
    } catch (e) {
      return err(e) as Err<E>
    }
  };
}
