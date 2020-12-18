import { err, ok, Result } from '@dukeferdinand/ts-results';

import { toString } from '../sync';

export interface GlobalConfig<T = unknown>
  extends Omit<RequestInit, 'body' | 'method'> {
  baseUrl?: string;
  shouldThrow?: (response: T) => boolean;
}

export type ExcludeBody<T> = Pick<T, Exclude<keyof T, 'body'>>;

export type LocalConfig<B> = ExcludeBody<RequestInit> & {
  body?: B;
  customFetch?: FetchType;
};

export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export function initSmartFetch(config: GlobalConfig = {}): void {
  window.__SMART_FETCH_CONFIG__ = config;
}

export function getSmartFetchConfig(): GlobalConfig {
  return typeof window !== 'undefined' ? window.__SMART_FETCH_CONFIG__ : {};
}

export type FetchType = typeof fetch;

export async function smartFetch<T, E extends Error>(
  method: RequestMethods,
  uri: string,
  config: LocalConfig<unknown> & GlobalConfig<T | E> = {}
): Promise<Result<T, E>> {
  // Extract any extra keys from combined config, the rest turns into `localConfig`
  const { shouldThrow, baseUrl, body, customFetch, ...localConfig } = {
    ...getSmartFetchConfig(),
    ...config,
  };

  const constructedURL = `${baseUrl || ''}${uri}`;

  // Attach method to final fetch config
  let fetchConfig: GlobalConfig & LocalConfig<string> = {
    ...localConfig,
    method,
  };

  // FINALLY, attach body if required
  if (body) {
    fetchConfig = { ...fetchConfig, body: toString(body) };
  }

  try {
    // Actual fetch call
    const fetcher = customFetch || fetch;
    const res = await fetcher(constructedURL, fetchConfig);
    const parsed: T | E = await res.json();

    // Res isn't a 400, 500, or other custom error
    if (res.ok && !(shouldThrow && shouldThrow(parsed))) {
      // Everything is okay, return okay data
      return ok(parsed as T);
    }

    // Something went wrong, return Err wrapped data
    return err<E>(parsed as E);
  } catch (e) {
    // Something broke that was not able to be caught by normal means
    return err<E>(e);
  }
}
