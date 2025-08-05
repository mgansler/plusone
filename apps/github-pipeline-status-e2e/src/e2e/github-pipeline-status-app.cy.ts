import { currentUser, org1, org2, organizations } from '../fixtures'
import { login } from '../support/app.po'
import { mapGraphqlResponse } from '../support/map-graphql-response'

describe('github-pipeline-status', () => {
  beforeEach(() => {
    cy.visit('/')

    cy.intercept('POST', 'https://api.github.com/graphql', (req) => {
      mapGraphqlResponse(req, {
        avatarUrl: currentUser,
        organizations: organizations,
        'org:org1': org1,
        'org:org2': org2,
      })
    })

    login()
  })

  it('should be able to logout and login again', () => {
    cy.findByText(/test user/i)
    cy.findByText(/logout/i).click()

    cy.findByLabelText(/personal access token/i).should('have.value', '')

    login()
  })

  it('should be able to select an organization', () => {
    cy.on('uncaught:exception', (err) => {
      // ignore error, that is thrown by MUI during this test
      expect(err.message).to.include("Cannot read properties of null (reading 'contains')")
      return false
    })

    cy.findByLabelText(/select organization/i).click()
    cy.findByRole('option', { name: /test org 2/i }).should('be.visible')
    cy.findByRole('option', { name: /test org 1/i })
      .should('be.visible')
      .click()

    // test org 1 should now be selected
    cy.findByText(/test org 1/i).should('be.visible')
    cy.findByText(/test org 2/i).should('not.exist')

    cy.findByLabelText(/select organization/i).click()
    cy.findByRole('option', { name: /test org 1/i }).should('be.visible')
    cy.findByRole('option', { name: /test org 2/i })
      .should('be.visible')
      .click()

    // test org 2 should now be selected
    cy.findByText(/test org 1/i).should('not.exist')
    cy.findByText(/test org 2/i).should('be.visible')
  })

  it('should have filters', () => {
    cy.on('uncaught:exception', (err) => {
      // ignore error, that is thrown by MUI during this test
      expect(err.message).to.include("Cannot read properties of null (reading 'contains')")
      return false
    })

    cy.visit('/organization/org2')

    cy.findByLabelText(/repository name/i)
      .should('have.value', '')
      .type('repo-one')
    cy.location().its('search').should('contain', 'filter=repo-one')

    cy.findByText(/show all/i).should('be.visible')
    cy.findByLabelText(/filter details by user/i).click()
    cy.findByText(/show dependabot only/i).should('be.visible')
    cy.findByText(/show user only/i).should('be.visible')
    cy.findByText(/show user only/i).click()
    cy.findByText(/show all/i).should('not.exist')
    cy.findByText(/show dependabot only/i).should('not.exist')
    cy.findByText(/show user only/i).should('be.visible')

    cy.findByLabelText(/show only open prs/i).should('not.be.checked')
    cy.findByLabelText(/show only open prs/i).click()
    cy.findByLabelText(/show only open prs/i).should('be.checked')
  })
})
