import React from 'react'
import { Link, Redirect, Route, useRouteMatch } from 'react-router-dom'

import { getDateFor, getWeekOfYearFor, getYearFor } from '@plusone/date-utils'

import { Week } from './week/week'

/* eslint-disable-next-line */
export interface DinnerPlanProps {}

export function DinnerPlan(props: DinnerPlanProps) {
  const { path, url } = useRouteMatch()

  const lastWeeksYear = getYearFor('last-week')
  const lastWeek = getWeekOfYearFor(getDateFor('last-week'))
  const todaysYear = getYearFor('today')
  const todaysWeek = getWeekOfYearFor(getDateFor('today'))
  const nextWeeksYear = getYearFor('next-week')
  const nextWeek = getWeekOfYearFor(getDateFor('next-week'))

  return (
    <>
      <h2>Welcome to dinner-plan!</h2>

      <nav>
        <ul>
          <li>
            <Link to={`${url}/${lastWeeksYear}/${lastWeek}`}>Last Week</Link>
          </li>
          <li>
            <Link to={`${url}/${todaysYear}/${todaysWeek}`}>This Week</Link>
          </li>
          <li>
            <Link to={`${url}/${nextWeeksYear}/${nextWeek}`}>Next Week</Link>
          </li>
        </ul>
      </nav>

      <Route exact={true} path={path}>
        <Redirect to={`${url}/${todaysYear}/${todaysWeek}`} />
      </Route>

      <Route exact={true} path={`${path}/:year/:week`}>
        <Week />
      </Route>
    </>
  )
}
