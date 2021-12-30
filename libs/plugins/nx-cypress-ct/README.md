# Cypress Component Testing configuration

[Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction) is awesome!
And with Nx it is so easy to get started. All you need is a tiny bit of configuration, and you are ready to go.

Just run `nx generate @mgansler/nx-cypress-ct:config <project>` and you can create your first component test:

```typescript jsx
import { mount } from '@cypress/react'

describe('Your Component', () => {
  it('should have a heading', () => {
    mount(<h1>Hello World!</h1>)

    cy.findByRole('heading').should('contain.text', 'Hello World!')
  })
})
```

It works just like the regular Cypress target, the default configuration is great for CI while with the watch mode you
can actually see how your component looks and behaves in a browser.
