import { render, screen } from '@testing-library/react'

import { AppWithProviders } from './app'

jest.mock('./user-info/user-info')
jest.mock('./organizations/organizations')

describe('AppWithProviders', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AppWithProviders />)

    expect(baseElement).toBeTruthy()
  })

  it('should have a greeting as the title', () => {
    render(<AppWithProviders />)

    expect(screen.getByText(/github pipeline status/i)).toBeInTheDocument()
  })
})
