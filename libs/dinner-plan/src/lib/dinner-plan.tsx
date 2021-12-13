import React from 'react'
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import { Button, Container, Paper, Toolbar, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import { getDateFor, getWeekOfYearFor, getYearFor } from '@plusone/date-utils'

import { Dishes } from './dishes/dishes'
import { DinnerPlanStore } from './store/dinner-plan.store'
import { Week } from './week/week'

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
  const match = useMatch(':app/:year/:week')
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
