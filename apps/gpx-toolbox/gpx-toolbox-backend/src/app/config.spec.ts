import { debugEndpointsEnabled } from './config'

describe('debugEndpointsEnabled', () => {
  it.each([
    [{ NODE_ENV: 'development' }, true],
    [{ NODE_ENV: 'production' }, false],
    [{ NODE_ENV: 'test' }, false],
    [{}, false],
  ])('%o → %s', (env, expected) => {
    expect(debugEndpointsEnabled(env)).toBe(expected)
  })
})
