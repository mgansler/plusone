import { render } from '@testing-library/react'

import { Day } from './day'

describe('Day', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Day />)
    expect(baseElement).toBeTruthy()
  })
})
