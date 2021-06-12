import { render } from '@testing-library/react'

import { FeedsWebUserView } from './feeds-web-user-view'

describe('FeedsWebUserView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeedsWebUserView />)
    expect(baseElement).toBeTruthy()
  })
})
