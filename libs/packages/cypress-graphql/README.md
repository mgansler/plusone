# Cypress GraphQL

This library aims to simplify interception GraphQL calls with Cypress.

## Examples

A simple fetch:

```typescript jsx
cy.graphql('fixture.json').as('fetch')

// make the call
cy.findByRole('button', { name: 'Fetch it!' }).click()

cy.wait('@fetch')
```

Filter for some text in the GraphlQL query:

```typescript jsx
cy.graphql('user-info.json', { filter: 'User' }).as('fetch-user')
cy.graphql('something.json', { filter: 'Something' }).as('fetch-something')

// make the calls
cy.findByRole('button', { name: 'Load user info!' }).click()
cy.wait('@fetch-user')

cy.findByRole('button', { name: 'Load something' }).click()
cy.wait('@fetch-something')
```

Intercept mutations:

```typescript jsx
cy.graphql('mutation-response.json', { operationType: 'mutation' }).as('mutation')

// make the call
cy.findByRole('button', { name: 'Update data' }).click()

cy.wait('@mutation')
```
