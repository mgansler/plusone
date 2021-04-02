import { act, renderHook } from '@testing-library/react-hooks'

import { useBoolean } from './use-boolean'

describe('useBoolean', () => {
  it('should return the default value', () => {
    const { result } = renderHook(useBoolean)

    expect(result.current[0]).toBe(false)
  })

  it('should return the initial value', () => {
    const { result } = renderHook(useBoolean, { initialProps: true })

    expect(result.current[0]).toBe(true)
  })

  it('should be possible to change the value', () => {
    const { result } = renderHook(useBoolean)

    expect(result.current[0]).toBe(false)

    act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[2]()
    })

    expect(result.current[0]).toBe(false)
  })
})
