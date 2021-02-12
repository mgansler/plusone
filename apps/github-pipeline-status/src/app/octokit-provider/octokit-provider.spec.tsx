import React from 'react'
import { render } from '@testing-library/react'

import { OctokitProvider } from './octokit-provider'

describe('OctokitProvider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OctokitProvider />)
    expect(baseElement).toBeTruthy()
  })
})
