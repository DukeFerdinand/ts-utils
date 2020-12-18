import { Err, Ok } from '@dukeferdinand/ts-results';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import * as SmartFetch from '..';

const { smartFetch, RequestMethods } = SmartFetch;

/**
 * Quick description of this file:
 * "no DOM" is intended to mean anywhere that doesn't have access to a `window` key.
 * You can still use the config param when passing global config options to any given fetch request.
 * This will vary WILDLY from library to library, so just look up your preferred SSR state or context docs
 */

describe('SmartFetch no DOM', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });
  it('still catches errors without breaking', async () => {
    const res = await smartFetch(RequestMethods.GET, '/');

    expect(res).toBeInstanceOf(Err);
    expect(res).toMatchSnapshot();
  });

  it('still returns okay values without breaking', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: 'here' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    const res = await smartFetch(RequestMethods.GET, '/');

    expect(res).toBeInstanceOf(Ok);
    expect(res).toMatchSnapshot();
  });

  it('allows global configs to be passed in via `config`', async () => {
    fetchMock.mockResponse(JSON.stringify({ data: 'not needed' }));

    // Get this from wherever and pass in at the function or service level
    const globalConfig: SmartFetch.GlobalConfig = {
      baseUrl: 'https://google.com',
    };

    await smartFetch(RequestMethods.GET, '/', globalConfig);

    expect(fetchMock).toBeCalled();
    expect(fetchMock).toBeCalledWith('https://google.com/', { method: 'GET' });
  });

  it('body and config do not conflict', async () => {
    fetchMock.mockResponse(JSON.stringify({ data: 'not needed' }));

    // Get this from wherever and pass in at the function or service level
    const globalConfig: SmartFetch.GlobalConfig = {
      baseUrl: 'https://google.com',
    };

    await smartFetch(RequestMethods.GET, '/', {
      ...globalConfig,
      body: { test: '' },
    });

    expect(fetchMock).toBeCalled();
    expect(fetchMock).toBeCalledWith('https://google.com/', {
      body: '{"test":""}',
      method: 'GET',
    });
  });

  it('uses custom fetch when passed in', async () => {
    /**
     * This mock represents the "fetch" options provided by things like
     * isomorphic-unfetch and similar fetch replacers
     */
    const fetchFake = jest.fn();
    const globalConfig: SmartFetch.GlobalConfig = {
      baseUrl: 'https://google.com',
    };

    await smartFetch(RequestMethods.GET, '/', {
      ...globalConfig,
      body: { test: '' },
      customFetch: fetchFake,
    });

    expect(fetchFake).toHaveBeenCalled();
    expect(fetchFake).toBeCalledWith('https://google.com/', {
      body: '{"test":""}',
      method: 'GET',
    });
  });
});
