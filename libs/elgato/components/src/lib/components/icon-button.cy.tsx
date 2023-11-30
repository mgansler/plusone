import { TrashBin } from '../icons'

import { IconButton } from './icon-button'

describe('IconButton', () => {
  it('should allow clicking', () => {
    const onClickSpy = cy.spy().as('onClick')
    cy.mount(<IconButton onClick={onClickSpy} icon={<TrashBin />} label={'delete-me'} />)

    cy.findByRole('button', { name: 'delete-me' }).click()
    cy.get('@onClick').should('have.been.calledOnce')
  })
})
