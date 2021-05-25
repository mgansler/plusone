import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { getWeekOfYearFor } from '@plusone/date-utils'

import { Day } from '../day/day'

const useClassNames = makeStyles((theme) =>
  createStyles({
    week: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gridGap: 12,
    },
  }),
)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WeekProps {}

export function Week(props: WeekProps) {
  const classNames = useClassNames()
  const currentWeekNumber = getWeekOfYearFor(new Date())
  const { week } = useParams<{ week: string; year: string }>()

  const isCurrentWeek = Number(week) === currentWeekNumber

  return (
    <>
      <h4>KW {week}</h4>
      <div className={classNames.week}>
        {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => (
          <Day key={dayOfWeek} dayOfWeek={dayOfWeek} isCurrentWeek={isCurrentWeek} />
        ))}
      </div>
    </>
  )
}
