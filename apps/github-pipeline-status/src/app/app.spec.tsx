import { render } from '@testing-library/react'

import { App } from './app'

jest.mock('./user-info/user-info')
jest.mock('./organizations/organizations')

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />)

    expect(baseElement).toBeTruthy()
  })

  it('should have a greeting as the title', () => {
    const { getByText } = render(<App />)

    expect(getByText(/github pipeline status/i)).toBeInTheDocument()
  })
})
