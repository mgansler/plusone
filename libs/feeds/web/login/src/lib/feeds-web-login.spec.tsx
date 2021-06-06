import { render } from '@testing-library/react'

import { FeedsWebLogin } from './feeds-web-login'

describe('FeedsWebLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeedsWebLogin onSubmit={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })
})
