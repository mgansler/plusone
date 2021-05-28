import React from 'react'
import { Redirect, Route, useHistory, useRouteMatch } from 'react-router-dom'
import { Button, Container, createStyles, makeStyles, Paper, Toolbar, Typography } from '@material-ui/core'

import { getDateFor, getWeekOfYearFor, getYearFor } from '@plusone/date-utils'

import { Week } from './week/week'
import { DinnerPlanStore } from './store/dinner-plan.store'
import { Dishes } from './dishes/dishes'

const useClassNames = makeStyles((theme) =>
  createStyles({
    toolbar: {
      display: 'grid',
      gridTemplateColumns: '1fr 50% 1fr',
    },
    navigation: {
      display: 'flex',
      justifyContent: 'space-around',
    },
  }),
)

export function DinnerPlan() {
  const { path, url } = useRouteMatch()
  const match = useRouteMatch<{ week: string }>(`${path}/:year/:week`)

  const classNames = useClassNames()

  const lastWeeksYear = getYearFor('last-week')
  const lastWeek = getWeekOfYearFor(getDateFor('last-week'))
  const thisWeeksYear = getYearFor('this-week')
  const thisWeek = getWeekOfYearFor(getDateFor('this-week'))
  const nextWeeksYear = getYearFor('next-week')
  const nextWeek = getWeekOfYearFor(getDateFor('next-week'))

  const history = useHistory()

  return (
    <DinnerPlanStore>
      <Container>
        <Paper>
          <Toolbar className={classNames.toolbar}>
            <Typography>KW {match?.params.week}</Typography>
            <nav className={classNames.navigation}>
              <Button variant={'outlined'} onClick={() => history.push(`${url}/${lastWeeksYear}/${lastWeek}`)}>
                Last Week
              </Button>
              <Button variant={'outlined'} onClick={() => history.push(`${url}/${thisWeeksYear}/${thisWeek}`)}>
                This Week
              </Button>
              <Button variant={'outlined'} onClick={() => history.push(`${url}/${nextWeeksYear}/${nextWeek}`)}>
                Next Week
              </Button>
            </nav>
          </Toolbar>

          <Route exact={true} path={path}>
            <Redirect to={`${url}/${thisWeeksYear}/${thisWeek}`} />
          </Route>

          <Route exact={true} path={`${path}/:year/:week`}>
            <Week />
          </Route>

          <Dishes />
        </Paper>
      </Container>
    </DinnerPlanStore>
  )
}
