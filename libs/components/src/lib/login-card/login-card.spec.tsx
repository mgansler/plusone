import { render } from '@testing-library/react'

import { LoginCard } from './login-card'

describe('LoginCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <LoginCard>
        <div>dummy child</div>
      </LoginCard>,
    )
    expect(baseElement).toBeTruthy()
  })
})
