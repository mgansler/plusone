import React from 'react'
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom'
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
  const match = useMatch<'week'>(':app/:year/:week')
  const navigate = useNavigate()

  const classNames = useClassNames()

  const lastWeeksYear = getYearFor('last-week')
  const lastWeek = getWeekOfYearFor(getDateFor('last-week'))
  const thisWeeksYear = getYearFor('this-week')
  const thisWeek = getWeekOfYearFor(getDateFor('this-week'))
  const nextWeeksYear = getYearFor('next-week')
  const nextWeek = getWeekOfYearFor(getDateFor('next-week'))

  return (
    <DinnerPlanStore>
      <Container>
        <Paper>
          <Toolbar className={classNames.toolbar}>
            <Typography>KW {match?.params.week}</Typography>
            <nav className={classNames.navigation}>
              <Button variant={'outlined'} onClick={() => navigate(`${lastWeeksYear}/${lastWeek}`)}>
                Last Week
              </Button>
              <Button variant={'outlined'} onClick={() => navigate(`${thisWeeksYear}/${thisWeek}`)}>
                This Week
              </Button>
              <Button variant={'outlined'} onClick={() => navigate(`${nextWeeksYear}/${nextWeek}`)}>
                Next Week
              </Button>
            </nav>
          </Toolbar>

          <Routes>
            <Route path={'*'} element={<Navigate to={`${thisWeeksYear}/${thisWeek}`} />} />
            <Route path={':year/:week'} element={<Week />} />
          </Routes>

          <Dishes />
        </Paper>
      </Container>
    </DinnerPlanStore>
  )
}
