import { err, ok, Result } from '@dukeferdinand/ts-results'


export function asyncWrapped<T, E extends Error, F extends (...args: unknown[]) => T>(fn: F): () => Promise<Result<T, E>> {
  return async function (...args: unknown[]): Promise<Result<T, E>> {
    try {
      const res = await fn(...args)
      return ok(res)
    } catch (e) {
      return err(e)
    }
  };
}

