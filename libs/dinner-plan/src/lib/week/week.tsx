import type { Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import React from 'react'
import { useParams } from 'react-router-dom'

import { getWeekOfYearFor } from '@plusone/date-utils'

import { Day } from '../day/day'

const useClassNames = makeStyles<Theme>((theme) =>
  createStyles({
    week: {
      padding: theme.spacing(3),
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gridGap: theme.spacing(2),
    },
  }),
)

export function Week() {
  const classNames = useClassNames()
  const currentWeekNumber = getWeekOfYearFor(new Date())
  const { week } = useParams<'week'>()

  const isCurrentWeek = Number(week) === currentWeekNumber

  return (
    <div className={classNames.week}>
      {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
        <Day key={dayOfWeek} dayOfWeek={dayOfWeek} isCurrentWeek={isCurrentWeek} />
      ))}
    </div>
  )
}
