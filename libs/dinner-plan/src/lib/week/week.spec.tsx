import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { Week } from './week'

describe('Week', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Week />
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
