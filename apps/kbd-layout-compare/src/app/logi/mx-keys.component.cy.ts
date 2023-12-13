import { TestBed } from '@angular/core/testing'

import { MxKeysComponent } from './mx-keys.component'

describe(MxKeysComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(MxKeysComponent, {
      add: {
        imports: [],
        providers: [],
      },
    })
  })

  it('renders', () => {
    cy.mount(MxKeysComponent)
  })
})
