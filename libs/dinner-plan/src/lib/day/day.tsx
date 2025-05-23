import { Card, CardContent, CardHeader, Typography } from '@mui/material'
import type { DragEventHandler } from 'react'
import { useParams } from 'react-router-dom'

import { useDinnerPlanStoreDispatch, useDishForDay } from '../store/dinner-plan.store'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export type DayProps = {
  dayOfWeek: number
  isCurrentWeek?: boolean
}

export function Day({ dayOfWeek, isCurrentWeek }: DayProps) {
  const { year = '2020', week = '01' } = useParams<'week' | 'year'>()

  const isToday = isCurrentWeek && (new Date().getDay() || 7) === dayOfWeek
  const weekday = DAYS[dayOfWeek - 1]

  const dispatch = useDinnerPlanStoreDispatch()
  const dish = useDishForDay({ year, week, weekday })

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    const name = event.dataTransfer?.getData('text/plain')
    dispatch({
      type: 'plan-dish',
      payload: { week, year, weekday, dish: name },
    })
  }

  return (
    <Card>
      <CardHeader titleTypographyProps={{ color: isToday ? 'primary' : 'inherit' }} title={weekday} />
      <CardContent
        sx={{
          minHeight: 72,
          '&:hover': {},
        }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {dish ? <Typography paragraph={true}>{dish}</Typography> : null}
      </CardContent>
    </Card>
  )
}
