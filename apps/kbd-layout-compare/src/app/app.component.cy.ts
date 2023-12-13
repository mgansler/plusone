import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { AppComponent } from './app.component'

describe(AppComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(AppComponent, {
      add: {
        imports: [RouterTestingModule],
        providers: [],
      },
    })
  })

  it('renders', () => {
    cy.mount(AppComponent)

    cy.findByRole('link', { name: 'Logi MX Keys' })
      .should('be.visible')
      .should('have.attr', 'href')
      .and('eq', '/logi/mx-keys')
  })
})
