import { Err, Ok } from '@dukeferdinand/ts-results'
import { Async } from '../lib/async'

const { asyncWrapped } = Async

describe('Async wrapped util', () => {
  it('returns Ok wrapped values on successful calls', async () => {
    const res = await asyncWrapped(() => 5)()
    expect(res).toBeInstanceOf(Ok)
    expect(res.unwrap()).toBe(5)
  })

  it('catches and returns error objects', async () => {
    const res = await asyncWrapped(() => {
      throw new Error('[ Async Wrapped Error ] Test error for asyncWrapped')
    })()
    expect(res).toBeInstanceOf(Err)
    expect(res.unwrapErr()).toMatchSnapshot()
  })
})