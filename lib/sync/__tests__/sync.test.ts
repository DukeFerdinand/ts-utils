import { Err, Ok } from '@dukeferdinand/ts-results'
import { Sync } from '../..'

const { clone, wrapped, toString } = Sync

describe('Clone util', () => {
  it('clones a full object', () => {
    const obj = { test: 'test-val', testArr: [0, 1, 2] }
    const cloned = clone(obj)
    expect(cloned).toMatchObject(obj)
  })

  it('clones object except for methods', () => {
    const obj = { test: 'test-val', testFunc: () => console.log('I will not exist') }
    const cloned = clone(obj)

    expect(Object.keys(cloned)).toEqual(['test'])
  })

  it('clones an array', () => {
    const cloned = clone([0, 1, 2])
    expect(cloned).toEqual([0, 1, 2])
  })

  it('throws error when passed a function', () => {
    const dontCloneMe = () => {
      return 1
    }
    expect(() => clone(dontCloneMe)).toThrowErrorMatchingSnapshot()
  })
})

describe('ToString util', () => {
  it('throws an error when given function', () => {
    const f = () => "Don't stringify me!"

    expect(() => toString(f)).toThrowErrorMatchingSnapshot()

    // Stringifying a string will cause things like escaping quotes
    expect(toString(f())).toBe("\"Don't stringify me!\"")
  })

  it('correctly stringifies complex data', () => {
    const complex = {
      emptyKey: '',
      exampleArr: [0, 1, 2],
      exampleObj: { sub: 'test', subEmpty: '' }
    }
    const str = toString(complex)
    expect(str).toEqual('{"emptyKey":"","exampleArr":[0,1,2],"exampleObj":{"sub":"test","subEmpty":""}}')
  })
})

describe('Wrapped util', () => {
  it('returns wrapped values', () => {
    const res = wrapped(() => 4)()
    expect(res).toBeInstanceOf(Ok)
  })

  it('handles errors thrown inside wrapped function', () => {
    const res = wrapped(() => {
      throw new Error('[ Wrapped Error ] Wrapped error tester')
    })()
    expect(res).toBeInstanceOf(Err)
  })
})