import { render } from '@testing-library/react'

import { FeedsWebAdminView } from './feeds-web-admin-view'

describe('FeedsWebAdminView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeedsWebAdminView />)
    expect(baseElement).toBeTruthy()
  })
})
