import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import userEvent from '@testing-library/user-event'
import nock from 'nock'

import { AuthenticationProvider } from './authentication-provider'

describe('AuthenticationProvider', () => {
  const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  afterEach(() => {
    testQueryClient.clear()
    localStorage.clear()
  })

  it('should show the login page', () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <AuthenticationProvider children={<span>Child Component</span>} />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Welcome to feeds-web-login!')).toBeInTheDocument()
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

    // eslint-disable-next-line testing-library/prefer-find-by
    await waitFor(() => expect(nock.isDone()).toBeTruthy())

    await screen.findByText(/child component/i)
  })

  it('should allow to register', async () => {
    nock(/localhost/)
      .post('/api/authentication/register')
      .reply(201, { username: 'myuser' })

    render(
      <QueryClientProvider client={testQueryClient}>
        <AuthenticationProvider children={<span>child component</span>} />
      </QueryClientProvider>,
    )

    await screen.findByText('Welcome to feeds-web-login!')

    userEvent.click(screen.getByRole('tab', { name: /register/i }))
    userEvent.type(screen.getByLabelText(/username/i), 'myuser')
    userEvent.type(screen.getByLabelText(/password/i), 'do-not-tell')
    userEvent.click(screen.getByRole('button', { name: /register/i }))

    // eslint-disable-next-line testing-library/prefer-find-by
    await waitFor(() => expect(nock.isDone()).toBeTruthy())

    await screen.findByText(/successfully registered 'myuser'/i)
  })
})
