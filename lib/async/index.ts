import { err, ok, Result } from '@dukeferdinand/ts-results'


export function asyncWrapped<T, E extends Error, F extends () => T>(fn: F): () => Promise<Result<T, E>> {
  return async function (...args): Promise<Result<T, E>> {
    try {
      const res = await fn(...args)
      return ok(res)
    } catch (e) {
      return err(e)
    }
  };
}

