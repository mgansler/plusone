import { render } from '@testing-library/react'
// import nock from 'nock'

import { AppWithProviders } from './app'

describe.skip('App', () => {
  it('should render successfully', async () => {
    // nock(/localhost/)
    //   .post('/graphql')
    //   .reply(200, {
    //     data: {
    //       authorizationUri: 'http://localhost/dummy/autorization',
    //     },
    //   })

    const { baseElement } = render(<AppWithProviders />)

    // eslint-disable-next-line testing-library/prefer-find-by
    // await waitFor(() => expect(nock.isDone()).toBeTruthy())

    expect(baseElement).toBeTruthy()
  })
})
