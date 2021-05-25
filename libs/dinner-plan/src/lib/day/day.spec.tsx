import { render } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Day } from './day'

describe('Day', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter initialEntries={['/2021/01']}>
        <Route exact={true} path={'/:year/:week'}>
          <Day dayOfWeek={1} />
        </Route>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
