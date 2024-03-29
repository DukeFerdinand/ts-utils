/**
 * @jest-environment jsdom
 */

// I'm using a jsdom environment here as I'm explicitly testing browser functionality vs node stuff for now
import { Err, Ok } from '@dukeferdinand/ts-results';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import * as SmartFetch from '..';

describe('SmartFetch config utils', () => {
  beforeEach(() => {
    SmartFetch.initSmartFetch({
      baseUrl: 'https://google.com',
    });
  });
  describe('when initializing', () => {
    it('sets __SMART_FETCH_CONFIG__', () => {
      expect(window.__SMART_FETCH_CONFIG__?.baseUrl).toBe('https://google.com');
    });
    it('overwrites previous config if called again', () => {
      SmartFetch.initSmartFetch({
        baseUrl: 'https://twitch.tv',
      });
      expect(window.__SMART_FETCH_CONFIG__?.baseUrl).toBe('https://twitch.tv');
    });
  });

  describe('when getting', () => {
    it('correctly retrieves __SMART_FETCH_CONFIG__', () => {
      const conf = SmartFetch.getSmartFetchConfig();
      expect(conf?.baseUrl).toBe('https://google.com');
    });
  });
});

describe('SmartFetch http client wrapper', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });
  it('pulls global config when window is available and local config not set', () => {
    const { smartFetch, RequestMethods } = SmartFetch;
    fetchMock.mockResponse(JSON.stringify({ data: 'not-needed' }));

    // Global config
    SmartFetch.initSmartFetch({
      baseUrl: 'https://google.com',
    });
    smartFetch(RequestMethods.GET, '/');

    expect(fetchMock).toBeCalled();
    expect(fetchMock).toBeCalledWith('https://google.com/', {
      method: 'GET',
    });
  });

  it('overrides global config with local when set', () => {
    const { smartFetch, RequestMethods } = SmartFetch;
    fetchMock.mockResponse(JSON.stringify({ data: 'not-needed' }));

    // Global config
    SmartFetch.initSmartFetch({
      baseUrl: 'https://google.com',
    });
    smartFetch(RequestMethods.GET, '/', { baseUrl: 'https://twitter.com' });

    expect(fetchMock).toBeCalled();
    expect(fetchMock).toBeCalledWith('https://twitter.com/', {
      method: 'GET',
    });
  });

  it('handles no baseUrl being set', () => {
    const { smartFetch, RequestMethods } = SmartFetch;
    fetchMock.mockResponse(JSON.stringify({ data: 'not-needed' }));

    // Global config
    SmartFetch.initSmartFetch();
    smartFetch(RequestMethods.GET, '/');

    expect(fetchMock).toBeCalled();
    expect(fetchMock).toBeCalledWith('/', {
      method: 'GET',
    });
  });

  it('returns good data wrapped in Ok variant', async () => {
    fetchMock.mockResponse(JSON.stringify({ ip: '10.0.1.1' }));

    const res = await SmartFetch.smartFetch(
      SmartFetch.RequestMethods.GET,
      '/fake-ip-route?format=json'
    );
    expect(res).toBeInstanceOf(Ok);
    expect(res.unwrap()).toEqual({ ip: '10.0.1.1' });
  });

  it('returns good, non JSON data wrapped in Ok variant', async () => {
    fetchMock.mockResponse('string response');

    const res = await SmartFetch.smartFetch(
      SmartFetch.RequestMethods.GET,
      '/fake-ip-route?format=json'
    );
    expect(res).toBeInstanceOf(Ok);
    expect(res.unwrap()).toEqual('string response');
  });

  it('returns "bad" http statuses as Err variants', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Message here' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
    const res = await SmartFetch.smartFetch(
      SmartFetch.RequestMethods.GET,
      '/bad-route'
    );

    expect(res).toBeInstanceOf(Err);
    expect(res.unwrapErr()).toEqual({ error: 'Message here' });
  });

  it('uses shouldThrow to catch any non standard errors', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Message here' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    // Mock example to catch any response with an 'error' key, but only if 'error' is not an empty string
    function shouldThrow(res: { [index: string]: unknown } | Error) {
      if (res instanceof Error) return true;
      if (Object.keys(res).includes('error') && res.error !== '') {
        return true;
      }
      return false;
    }

    // Break because error is not an empty string
    const shouldError = await SmartFetch.smartFetch(
      SmartFetch.RequestMethods.GET,
      '/bad-route',
      {
        shouldThrow,
      }
    );

    expect(shouldError).toBeInstanceOf(Err);

    // Specifically allow error key with empty string in this test
    fetchMock.mockResponseOnce(JSON.stringify({ error: '' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const shouldNOTError = await SmartFetch.smartFetch(
      SmartFetch.RequestMethods.GET,
      '/okay-route',
      {
        shouldThrow,
      }
    );

    expect(shouldNOTError).toBeInstanceOf(Ok);
  });

  it('handles unexpected/critical errors', async () => {
    const { smartFetch } = SmartFetch;

    fetchMock.mockRejectOnce(new Error('Testing when something breaks'));
    const shouldCatch = await smartFetch(
      SmartFetch.RequestMethods.GET,
      '/bad-route'
    );

    expect(shouldCatch).toBeInstanceOf(Err);
    expect(shouldCatch.unwrapErr().message).toBe(
      'Testing when something breaks'
    );
  });

  it('catches errors from broken filter functions', async () => {
    const { smartFetch } = SmartFetch;
    class CustomError extends Error {}

    function shouldThrow(res: unknown) {
      throw new CustomError('[ smartFetch ] Something went very wrong');
      if (res) {
        return true;
      }
      return false;
    }

    fetchMock.mockResponseOnce(JSON.stringify({ error: 'unrecoverable' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    const res = await smartFetch<{ error: string }, CustomError>(
      SmartFetch.RequestMethods.GET,
      '/bad-route',
      {
        shouldThrow,
      }
    );

    expect(res).toBeInstanceOf(Err);
    expect(res.unwrapErr().message).toBe(
      '[ smartFetch ] Something went very wrong'
    );
  });
});
