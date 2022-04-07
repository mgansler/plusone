import { renderHook } from '@testing-library/react-hooks'

import { useLocalStorage } from './use-localstorage'

// Skipped until '@testing-library/react-hooks' supports react v18
describe.skip('useLocalStorage', () => {
  const key = 'test-key'

  it('should return the default value', () => {
    const { result } = renderHook(useLocalStorage, {
      initialProps: { key, defaultValue: 'hello world' },
    })

    expect(result.current[0]).toBe('hello world')
  })
})
