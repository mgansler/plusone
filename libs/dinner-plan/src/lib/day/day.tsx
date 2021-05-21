import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import classnames from 'classnames'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const useClassNames = makeStyles((theme) =>
  createStyles({
    today: {
      backgroundColor: 'azure',
    },
  }),
)

export interface DayProps {
  dayOfWeek: number
  isCurrentWeek?: boolean
}

export function Day({ dayOfWeek, isCurrentWeek }: DayProps) {
  const classNames = useClassNames()

  const isToday = isCurrentWeek && new Date().getDay() === dayOfWeek

  return (
    <div className={classnames({ [classNames.today]: isToday })}>
      <h4>{DAYS[dayOfWeek - 1]}</h4>
    </div>
  )
}
