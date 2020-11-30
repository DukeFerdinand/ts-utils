import { err, ok, Result } from "@dukeferdinand/ts-results";

import { toString } from "../sync";

export interface GlobalConfig<T = unknown>
  extends Omit<RequestInit, "body" | "method"> {
  baseUrl?: string;
  shouldThrow?: (response: T) => boolean;
}

export type LocalConfig = RequestInit;

export enum RequestMethods {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
  PATCH = "PATCH",
}

export function initSmartFetch(config: GlobalConfig): void {
  window.__SMART_FETCH_CONFIG__ = config;
}

export function getSmartFetchConfig(): GlobalConfig {
  return window.__SMART_FETCH_CONFIG__ || ({} as GlobalConfig);
}

export async function smartFetch<T, E extends Error>(
  method: RequestMethods,
  url: string,
  body?: unknown,
  config: GlobalConfig<T | E> = {}
): Promise<Result<T, E>> {
  const { shouldThrow, ...local } = config;

  // local will always override global unless otherwise allowed in the future
  let localConfig: GlobalConfig & RequestInit = {
    ...window?.__SMART_FETCH_CONFIG__,
    ...local,
    method,
  };

  if (body) {
    localConfig = { ...localConfig, body: toString(body) };
  }

  try {
    // Actual fetch call
    const res = await fetch(url, localConfig);
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
