import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

const useClassNames = makeStyles((theme) =>
  createStyles({
    week: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
    },
  }),
)

export interface WeekProps {
  isCurrent?: boolean
}

export function Week({ isCurrent }: WeekProps) {
  console.log({ isCurrent: isCurrent })

  const classNames = useClassNames()

  return (
    <div className={classNames.week}>
      <div>
        <h4>Monday</h4>
      </div>
      <div>
        <h4>Tuesday</h4>
      </div>
      <div>
        <h4>Wednesday</h4>
      </div>
      <div>
        <h4>Thursday</h4>
      </div>
      <div>
        <h4>Friday</h4>
      </div>
      <div>
        <h4>Saturday</h4>
      </div>
      <div>
        <h4>Sunday</h4>
      </div>
    </div>
  )
}
