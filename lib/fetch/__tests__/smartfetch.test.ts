/**
 * @jest-environment jsdom
 */

// I'm using a jsdom environment here as I'm explicitly testing browser functionality vs node stuff for now
import { Err, Ok } from '@dukeferdinand/ts-results'
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()

import * as SmartFetch from '..'

describe('SmartFetch config utils', () => {
  beforeEach(() => {
    SmartFetch.initSmartFetch({
      baseUrl: 'https://google.com'
    })
  })
  describe('when initializing', () => {
    it('sets __SMART_FETCH_CONFIG__', () => {
      expect(window.__SMART_FETCH_CONFIG__?.baseUrl).toBe('https://google.com')
    })
    it('overwrites previous config if called again', () => {
      SmartFetch.initSmartFetch({
        baseUrl: 'https://twitch.tv'
      })
      expect(window.__SMART_FETCH_CONFIG__?.baseUrl).toBe('https://twitch.tv')
    })
  })

  describe('when getting', () => {
    it('correctly retrieves __SMART_FETCH_CONFIG__', () => {
      const conf = SmartFetch.getSmartFetchConfig()
      expect(conf?.baseUrl).toBe('https://google.com')
    })
  })
})

describe('SmartFetch http client wrapper', () => {
  it('returns good data wrapped in Ok variant', async () => {
    fetchMock.mockResponse(JSON.stringify({ "ip": "70.113.52.10" }))

    const res = await SmartFetch.smartFetch(SmartFetch.RequestMethods.GET, '/fake-ip-route?format=json')
    expect(res).toBeInstanceOf(Ok)
    expect(res.unwrap()).toEqual({ "ip": "70.113.52.10" })
  })

  it('returns "bad" http statuses as Err variants', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Message here' }), { status: 500, headers: { 'content-type': 'application/json' } })
    const res = await SmartFetch.smartFetch(SmartFetch.RequestMethods.GET, '/bad-route')

    expect(res).toBeInstanceOf(Err)
    expect(res.unwrapErr()).toEqual({ "error": "Message here" })
  })

  it('uses shouldThrow to catch any non standard errors', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Message here' }), { status: 200, headers: { 'content-type': 'application/json' } })

    // Mock example to catch any response with an 'error' key, but only if 'error' is not an empty string
    function shouldThrow(res: { [index: string]: any }) {
      if (Object.keys(res).includes('error') && res.error !== '') {
        return true
      }
      return false
    }

    // Break because error is not an empty string
    const shouldError = await SmartFetch.smartFetch(SmartFetch.RequestMethods.GET, '/bad-route', null, {
      shouldThrow
    })

    expect(shouldError).toBeInstanceOf(Err)

    // Specifically allow error key with empty string in this test
    fetchMock.mockResponseOnce(JSON.stringify({ error: '' }), { status: 200, headers: { 'content-type': 'application/json' } })

    const shouldNOTError = await SmartFetch.smartFetch(SmartFetch.RequestMethods.GET, '/okay-route', null, {
      shouldThrow
    })

    expect(shouldNOTError).toBeInstanceOf(Ok)

  })
})