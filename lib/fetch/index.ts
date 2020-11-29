import { err, ok, Result } from "@dukeferdinand/ts-results";

import { toString } from '../sync'


export interface GlobalConfig<T = unknown> extends Omit<RequestInit, "body" | "method"> {
  baseUrl?: string;
  shouldThrow?: (response: T) => boolean
}

export type LocalConfig = RequestInit

export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH'
}

export function initSmartFetch(config: GlobalConfig): void {
  window.__SMART_FETCH_CONFIG__ = config
}

export function getSmartFetchConfig(): GlobalConfig {
  return window.__SMART_FETCH_CONFIG__ || {} as GlobalConfig
}


export async function smartFetch<T, E>(method: RequestMethods, url: string, body?: unknown, config: GlobalConfig<T | E> = {}): Promise<Result<T, E>> {
  const { shouldThrow, ...local } = config
  if (!window) {
    throw new Error('[ Smart Fetch ] Warning: cannot find window object. Isomorphic and other server side implementations are not available yet.')
  }

  let localConfig: GlobalConfig & RequestInit = { ...local, method }
  if (window && window.__SMART_FETCH_CONFIG__) {
    // local will always override global unless otherwise allowed in the future
    localConfig = { ...window.__SMART_FETCH_CONFIG__, ...localConfig }
  }

  if (body) { localConfig = { ...localConfig, body: toString(body) } }

  try {
    // Actual fetch call
    const res = await fetch(url, localConfig)

    // Res isn't a 400, 500, or other standard error
    if (res.ok) {
      const parsed: T | E = await res.json()

      // Custom error parser in case you need 200 but have an `error` key or similar need
      if (shouldThrow && shouldThrow(parsed)) {
        return err<E>(parsed as E)
      }

      // Everything is okay, return okay data
      return ok(parsed as T)
    } else {

      // Standard HTTP error or similar bad request occurred
      const parsed: T | E = await res.json()
      return err<E>(parsed as E)
    }
  } catch (e) {
    // Something broke that was not able to be caught by normal means
    return err<E>(e)
  }
}
