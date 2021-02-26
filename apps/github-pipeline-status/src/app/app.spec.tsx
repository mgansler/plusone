import React from 'react'
import { render } from '@testing-library/react'

import { App } from './app'

jest.mock('./user-info/user-info', () => ({
  UserInfo: () => <div>UserInfoMock</div>,
}))

jest.mock('./organizations/organizations', () => ({
  Organizations: () => <div>OrganizationsMock</div>,
}))

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />)

    expect(baseElement).toBeTruthy()
  })

  it('should have a greeting as the title', () => {
    const { getByText } = render(<App />)

    expect(getByText(/github pipeline status/i)).toBeTruthy()
  })
})
