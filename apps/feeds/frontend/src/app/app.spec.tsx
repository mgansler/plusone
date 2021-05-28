import { render, waitFor } from '@testing-library/react'
import nock from 'nock'

import { AppWithProviders } from './app'

describe('App', () => {
  it('should render successfully', async () => {
    nock(/localhost/)
      .post('/graphql')
      .reply(200, {
        data: {
          authorizationUri: 'http://localhost/dummy/autorization',
        },
      })

    const { baseElement } = render(<AppWithProviders />)

    await waitFor(() => expect(nock.isDone()).toBeTruthy())

    expect(baseElement).toBeTruthy()
  })
})
