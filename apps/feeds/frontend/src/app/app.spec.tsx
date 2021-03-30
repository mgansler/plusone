import React from 'react'
import { render } from '@testing-library/react'

import { AppWithProviders } from './app'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AppWithProviders />)

    expect(baseElement).toBeTruthy()
  })
})
