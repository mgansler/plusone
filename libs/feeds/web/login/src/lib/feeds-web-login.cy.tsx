import { createTheme, ThemeProvider } from '@mui/material'
import { mount } from 'cypress/react'
import type { ComponentProps } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthenticationProvider } from './authentication-provider'

function register() {
  cy.findByRole('tab', { name: /register/i }).click()

  cy.findByRole('textbox', { name: /username/i }).type('username')
  cy.findByLabelText(/password/i).type('password')

  cy.findByRole('button', { name: /register/i }).click()
  cy.wait('@register')
}

function login() {
  cy.findByRole('tab', { name: /login/i }).click()

  cy.findByRole('textbox', { name: /username/i }).type('username')
  cy.findByLabelText(/password/i).type('password')

  cy.findByRole('button', { name: /login/i }).click()
  cy.wait('@login')
}

function mountAuthenticationProvider(children: ComponentProps<typeof AuthenticationProvider>['children']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } },
  })

  mount(
    <ThemeProvider theme={createTheme()}>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider children={children} />
      </QueryClientProvider>
    </ThemeProvider>,
  )
}

describe('feeds-web-login', () => {
  it('should show the login', () => {
    mountAuthenticationProvider(<h1>This should not show</h1>)

    cy.findByRole('heading', { name: 'This should not show' }).should('not.exist')
    cy.findByRole('heading', { name: 'Welcome to feeds-web-login!' }).should('be.visible')
  })

  it('should allow to register', () => {
    cy.intercept('POST', '/api/authentication/register', { fixture: 'register.json' }).as('register')

    mountAuthenticationProvider(<h1>This should not show</h1>)

    register()

    cy.findByRole('alert').should('contain.text', "Successfully registered 'username'").should('be.visible')
  })

  it('should fail to register when user exists', () => {
    cy.intercept('POST', '/api/authentication/register', { statusCode: 409 }).as('register')

    mountAuthenticationProvider(<h1>This should not show</h1>)

    register()

    cy.findByRole('alert').should('contain.text', "User 'username' already exists").should('be.visible')
  })

  it('should allow to login', () => {
    cy.intercept('POST', '/api/authentication/login', { fixture: 'login.json' }).as('login')
    cy.intercept('GET', '/api/authentication/profile', { fixture: 'profile.json' }).as('profile')

    mountAuthenticationProvider(<h1>This should show after login</h1>)

    login()
    cy.wait('@profile')

    cy.findByRole('heading', { name: 'This should show after login' }).should('be.visible')
  })

  it("should fail to login when password doesn't match", () => {
    cy.intercept('POST', '/api/authentication/login', { statusCode: 401 }).as('login')

    mountAuthenticationProvider(<h1>This should show after login</h1>)

    login()

    cy.findByRole('alert').should('contain.text', 'Invalid credentials').should('be.visible')
  })
})
