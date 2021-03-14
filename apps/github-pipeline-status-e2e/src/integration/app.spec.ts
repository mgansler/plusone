import { currentUser, org1, org2, organizations } from '../fixtures'
import { login } from '../support/app.po'

describe('github-pipeline-status', () => {
  beforeEach(() => {
    cy.visit('/')

    cy.intercept('POST', 'https://api.github.com/graphql', (req) => {
      switch (true) {
        case req.body.query.includes('avatarUrl'): {
          req.reply(currentUser)
          break
        }
        case req.body.query.includes('organizations'): {
          req.reply(organizations)
          break
        }
        case req.body.query.includes('org:org1'): {
          req.reply(org1)
          break
        }
        case req.body.query.includes('org:org2'): {
          req.reply(org2)
          break
        }
      }
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
    cy.findByLabelText(/select organization/i).click()
    cy.findByText(/test org 1/i).click()
    cy.findByText(/test org 1/i).should('be.visible')
    cy.findByText(/test org 2/i).should('not.exist')

    cy.findByLabelText(/select organization/i).click()
    cy.findByText(/test org 2/i).click()
    cy.findByText(/test org 1/i).should('not.exist')
    cy.findByText(/test org 2/i).should('be.visible')
  })

  it('should have filters', () => {
    cy.visit('/organization/org2')

    cy.findByLabelText(/repository name/i).should('have.value', '')
    cy.findByLabelText(/repository name/i).type('repo-one')
    cy.window().url().should('contain', 'filter=repo-one')

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
