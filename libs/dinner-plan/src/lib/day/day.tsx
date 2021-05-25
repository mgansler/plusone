import { DragEventHandler } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'

import { useDinnerPlanStoreDispatch, useDishForDay } from '../store/dinner-plan.store'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const useClassNames = makeStyles((theme) =>
  createStyles({
    today: {
      backgroundColor: 'azure',
    },
    dropzone: {
      backgroundColor: 'red',
      height: 60,
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
  const { year, week } = useParams<{ week: string; year: string }>()

  const isToday = isCurrentWeek && new Date().getDay() === dayOfWeek
  const weekday = DAYS[dayOfWeek - 1]

  const dispatch = useDinnerPlanStoreDispatch()
  const dish = useDishForDay({ year, week, weekday })

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    const name = event.dataTransfer?.getData('text/plain')
    dispatch({
      type: 'plan-dish',
      payload: { week, year, weekday, dish: { name, ingredients: [] } },
    })
  }

  return (
    <div className={clsx({ [classNames.today]: isToday })}>
      <h4>{weekday}</h4>
      <div className={classNames.dropzone} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        {dish ? <div>{dish.name}</div> : null}
      </div>
    </div>
  )
}
