Cypress.Commands.add('graphql', ({ queryIncludes, fixture }: { queryIncludes: string; fixture: string }) => {
  return cy.intercept('POST', '/graphql', (req) => {
    if (Object.prototype.hasOwnProperty.call(req.body, 'query') && req.body.query.includes(queryIncludes)) {
      req.reply({ fixture })
    }
  })
})
