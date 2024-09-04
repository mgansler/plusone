import { render, screen } from '@testing-library/react'
import userAction from '@testing-library/user-event'
import { afterEach } from 'vitest'

import { GetStreamDeckUrl } from './get-stream-deck-url'

describe('GetStreamDeckUrl', () => {
  afterEach(() => {
    Object.assign(window, {
      origin: undefined,
    })
  })

  it('should copy to clipboard', async () => {
    const copySpy = vi.spyOn(window.navigator.clipboard, 'writeText')
    Object.assign(window, {
      origin: 'http://localhost:1234',
    })

    render(<GetStreamDeckUrl macAddress={'ma:ca:dd:re:ss'} />)

    await userAction.click(screen.getByRole('button', { name: 'Copy to Clipboard' }))

    expect(copySpy).toHaveBeenCalledWith('http://localhost:1234/api/public/stream-deck/toggle/ma:ca:dd:re:ss')
  })
})
