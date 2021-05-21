import React from 'react'
import { Link, Route, useRouteMatch } from 'react-router-dom'

/* eslint-disable-next-line */
export interface DinnerPlanProps {}

export function DinnerPlan(props: DinnerPlanProps) {
  const { path, url } = useRouteMatch()

  return (
    <>
      <h2>Welcome to dinner-plan!</h2>

      <nav>
        <ul>
          <li>
            <Link to={`${url}/last-week`}>Last Week</Link>
          </li>
          <li>
            <Link to={`${url}`}>This Week</Link>
          </li>
          <li>
            <Link to={`${url}/next-week`}>Next Week</Link>
          </li>
        </ul>
      </nav>

      <Route path={`${path}/last-week`} exact={true}>
        <h3>Last Week</h3>
      </Route>

      <Route path={path} exact={true}>
        <h3>This Week</h3>
      </Route>

      <Route path={`${path}/next-week`} exact={true}>
        <h3>Next Week</h3>
      </Route>
    </>
  )
}
