import React, { DragEventHandler } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import classnames from 'classnames'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const useClassNames = makeStyles((theme) =>
  createStyles({
    today: {
      backgroundColor: 'azure',
    },
    dropzone: {
      backgroundColor: 'red',
      paddingBottom: '100%',
      '&:hover': {
        backgroundColor: 'blue',
      },
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
  const weekday = DAYS[dayOfWeek - 1]

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    console.log('I will eat', event.dataTransfer?.getData('text/plain'), 'on', weekday)
  }

  return (
    <div className={classnames({ [classNames.today]: isToday })}>
      <h4>{weekday}</h4>
      <div className={classNames.dropzone} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} />
    </div>
  )
}
