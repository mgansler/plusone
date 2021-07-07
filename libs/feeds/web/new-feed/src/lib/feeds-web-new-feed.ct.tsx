import { mount } from '@cypress/react'

import { FeedsWebNewFeed } from './feeds-web-new-feed'

describe('FeedsWebNewFeed', () => {
  it('should mount', () => {
    mount(<FeedsWebNewFeed />)
  })
})
