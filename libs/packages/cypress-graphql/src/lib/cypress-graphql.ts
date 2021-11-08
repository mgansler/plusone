export type Options = {
  operationType?: 'query' | 'mutation' | 'subscription'
  filter?: string
  url?: string
}

Cypress.Commands.add('graphql', (fixture: string, options: Options) => {
  const { url, operationType, filter }: Options = { operationType: 'query', url: '/graphql', ...options }

  return cy.intercept('POST', url, (req) => {
    if (filter) {
      if (Object.prototype.hasOwnProperty.call(req.body, operationType) && req.body[operationType].includes(filter)) {
        req.reply({ fixture })
      }
    } else {
      req.reply({ fixture })
    }
  })
})
