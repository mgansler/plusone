import { render } from '@testing-library/react'

import { FeedsWebNewFeed } from './feeds-web-new-feed'

describe('FeedsWebNewFeed', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeedsWebNewFeed />)
    expect(baseElement).toBeTruthy()
  })
})
