## @dukeferdinand/ts-utils

[![Build Status](https://travis-ci.com/DukeFerdinand/ts-utils.svg?branch=master)](https://travis-ci.com/DukeFerdinand/ts-utils) [![Maintainability](https://api.codeclimate.com/v1/badges/7c69c117fb3652083d1c/maintainability)](https://codeclimate.com/github/DukeFerdinand/ts-utils/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/7c69c117fb3652083d1c/test_coverage)](https://codeclimate.com/github/DukeFerdinand/ts-utils/test_coverage)

Welcome to my library!

If you're reading this you're probably looking for a small, easy to use library without a lot of frills, and with first class TypeScript support.

If so, you're in the right place!

### What's included
So far, not a lot. But what _is_ included is rock solid and tested to hell and back :)

#### sync utils
- `clone<T>(data: T): T` -> adds proper typing to the standard `JSON.parse(JSON.stringify(DATA))` pattern for cloning data in memory
- `toString(data: any): string` -> Slightly more user friendly `JSON.stringify` that primarily acts as a wrapper while disallowing functions (personal choice)
- `wrapped<T, E extends Error, F extends Function>(fn: F): () => Result<T, E>` -> this one is a heavy hitter. It builds off of my other library [@dukeferdinand/ts-results](https://www.npmjs.com/package/@dukeferdinand/ts-results) and acts as a synchronous error wrapper for any function that may or may not fail

#### async utils
- `asyncWrapped<T, E extends Error, F extends Function>(fn: F): () => Promise<Result<T, E>>` -> This one is pretty much just the async version of the previous `wrapped` util. It allows you to await a fallible function and gives you an `Ok` or `Err` response from whatever function you put in

#### fetch util
- `smartFetch` -> see code block below for full type declaration (it's long). This builds directly off of something I've use in production environments for critical internal systems. It's basically the same approach as the `asyncWrapped` util, but it adds a LOT more good stuff directly geared towards HTTP requests. You can use it _almost_ 100% as a replacement for `fetch` because it's just a wrapper that catches and labels errors and ok values alike. I say _almost_ as there's probably some edge case I won't ever run into in my typical use cases, but feel free to open an issue and I'll add it in.

Here's the main declaration as promised! See [the main fetch namespace](/lib/fetch/index.ts) for more technical details and types.
```ts
smartFetch<T, E>(
  method: RequestMethods, url: string, body?: any, config: GlobalConfig = {}
): Promise<Result<T, E>>
```

Here's a basic flow chart for how to use `smartFetch`:

1. Init your global config if needed:
```js

import { SmartFetch } from '@dukeferdinand/ts-utils'

// Optionally destructure here
SmartFetch.initSmartFetch({
  baseUrl: 'https://yourcompany.com'
})

```
2. Make a request, get your data!
```ts
const {RequestMethods} = SmartFetch

interface YourExpectedData {
  data: string;
  username: string;
}

interface YourCustomError {
  error: string;
  code: number;
  reason: string;
}

const res =
  await SmartFetch.smartFetch<YourExpectedData, YourCustomError>(RequestMethods.GET,'/get-route')

if (res.isOk()) {
  // Use your data
  return res.unwrap() // -> YourExpectedData
} else {
  // Handle your error
  return res.unwrapErr() // -> YourCustomError
}
```

3. Optionally, if your API returns something with a non standard HTTP error (i.e. a `200` can still be an error), create a custom handler. Your custom handler will be passed a `res` variable, which is anything that can possibly be returned to your app, but NOT a normal HTTP error, see [the main fetch namespace](/lib/fetch/index.ts) for more technical details. This is mainly because the error checking is fairly generic and only really checks `res.ok` before parsing anything as json.

```ts
// Mock example to catch any response with an 'error' key, but only if 'error' is not an empty string
function shouldThrow(res: { [index: string]: any }) {
  if (Object.keys(res).includes('error') && res.error !== '') {
    return true
  }
  return false
}

// Break because error is not an empty string
const shouldError = await SmartFetch.smartFetch(RequestMethods.GET, '/bad-route', null, {
  shouldThrow
})
```