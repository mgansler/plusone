import React from 'react'
import { render } from '@testing-library/react'

import UserInfo from './user-info'

describe('UserInfo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserInfo />)
    expect(baseElement).toBeTruthy()
  })
})
