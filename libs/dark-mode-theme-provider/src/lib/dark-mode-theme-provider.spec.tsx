import { render } from '@testing-library/react'

import { DarkModeThemeProvider } from './dark-mode-theme-provider'

describe('DarkModeThemeProvider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DarkModeThemeProvider children={'dummy child'} />)
    expect(baseElement).toBeTruthy()
  })
})
