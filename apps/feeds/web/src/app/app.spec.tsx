import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import App from './app'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    expect(baseElement).toBeTruthy()
  })

  it('should have a greeting as the title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    expect(screen.getByText('Welcome to web!')).toBeInTheDocument()
  })
})
