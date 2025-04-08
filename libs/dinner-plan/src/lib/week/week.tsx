import { useTheme } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router-dom'

import { getWeekOfYearFor } from '@plusone/date-utils'

import { Day } from '../day/day'

export function Week() {
  const theme = useTheme()
  const currentWeekNumber = getWeekOfYearFor(new Date())
  const { week } = useParams<'week'>()

  const isCurrentWeek = Number(week) === currentWeekNumber

  return (
    <div
      style={{
        padding: theme.spacing(3),
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridGap: theme.spacing(2),
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
        <Day key={dayOfWeek} dayOfWeek={dayOfWeek} isCurrentWeek={isCurrentWeek} />
      ))}
    </div>
  )
}
