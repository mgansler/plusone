import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { App } from './app'

describe('App', () => {
  it('should have a greeting as the title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    expect(screen.getByText(/martin's app suite/i)).toBeInTheDocument()
    expect(screen.getByText(/homepage/i)).toBeInTheDocument()
  })
})
