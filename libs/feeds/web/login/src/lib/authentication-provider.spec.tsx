import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import userEvent from '@testing-library/user-event'
import nock from 'nock'

import { AuthenticationProvider } from './authentication-provider'

describe('AuthenticationProvider', () => {
  const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  afterEach(() => {
    testQueryClient.clear()
  })

  it('should show the login page', () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <AuthenticationProvider children={<span>Child Component</span>} />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Welcome to feeds-web-login!'))
  })

  it('should allow to login', async () => {
    nock(/localhost/)
      .post('/api/authentication/login')
      .reply(201, { access_token: 'access_token' })
      .get('/api/authentication/profile')
      .reply(200, { username: 'myuser' })

    render(
      <QueryClientProvider client={testQueryClient}>
        <AuthenticationProvider children={<span>child component</span>} />
      </QueryClientProvider>,
    )

    userEvent.type(screen.getByLabelText(/username/i), 'myuser')
    userEvent.type(screen.getByLabelText(/password/i), 'do-not-tell')
    userEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(nock.isDone()).toBeTruthy())

    await waitFor(() => expect(screen.getByText(/child component/i)).toBeInTheDocument())
  })
})
