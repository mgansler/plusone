import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { DinnerPlanStore } from '../store/dinner-plan.store'

import { Day } from './day'

describe('Day', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <DinnerPlanStore>
        <MemoryRouter initialEntries={['/2021/01']}>
          <Route exact={true} path={'/:year/:week'}>
            <Day dayOfWeek={1} />
          </Route>
        </MemoryRouter>
        ,
      </DinnerPlanStore>,
    )
    expect(baseElement).toBeTruthy()
  })

  test.each`
    day            | weekday | date
    ${'Monday'}    | ${1}    | ${10}
    ${'Tuesday'}   | ${2}    | ${11}
    ${'Wednesday'} | ${3}    | ${12}
    ${'Thursday'}  | ${4}    | ${13}
    ${'Friday'}    | ${5}    | ${14}
    ${'Saturday'}  | ${6}    | ${15}
    ${'Sunday'}    | ${7}    | ${16}
  `('should highlight the current day: $day', ({ day, date, weekday }) => {
    // week 19, 10th of may to 16th of may
    jest.setSystemTime(new Date(Date.UTC(2021, 4, date)))

    render(
      <DinnerPlanStore>
        <MemoryRouter initialEntries={['/2021/19']}>
          <Route exact={true} path={'/:year/:week'}>
            <Day dayOfWeek={weekday} isCurrentWeek={true} />
          </Route>
        </MemoryRouter>
        ,
      </DinnerPlanStore>,
    )

    expect(screen.getByText(day)).toHaveClass('MuiTypography-colorPrimary')
  })
})
