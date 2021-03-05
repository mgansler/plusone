import React from 'react'
import { render, screen } from '@testing-library/react'

import { App } from './app'

describe('App', () => {
  it('should have a greeting as the title', () => {
    render(<App />)

    expect(screen.getByText(/quick zoom/i)).toBeInTheDocument()
  })
})
