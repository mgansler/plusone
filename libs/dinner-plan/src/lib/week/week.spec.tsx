import { render } from '@testing-library/react'

import { Week } from './week'

describe('Week', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Week />)
    expect(baseElement).toBeTruthy()
  })
})
