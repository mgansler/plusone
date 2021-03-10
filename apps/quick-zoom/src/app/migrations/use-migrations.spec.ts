import { renderHook } from '@testing-library/react-hooks'

import v1 from './v1.json'
import v2 from './v2.json'
import { useMigrations } from './use-migrations'

describe('useMigrations', () => {
  it('should migrate v1 to v2', () => {
    const setItemMock = jest.fn()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => JSON.stringify(v1),
        setItem: setItemMock,
      },
    })

    renderHook(useMigrations)

    expect(setItemMock).toHaveBeenCalledWith('zoomLinks', JSON.stringify(v2))
  })
})
