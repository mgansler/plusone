import { Tooltip } from '@material-ui/core'
import { Check, Error, FindReplace } from '@material-ui/icons'
import React from 'react'

import { CheckConclusionState } from '@plusone/github-schema'

export const CheckConclusionIconMap: Record<CheckConclusionState | 'RUNNING', JSX.Element> = {
  ACTION_REQUIRED: undefined,
  CANCELLED: undefined,
  FAILURE: (
    <Tooltip title={'Pipeline failed'}>
      <Error />
    </Tooltip>
  ),
  NEUTRAL: undefined,
  SKIPPED: undefined,
  STALE: undefined,
  STARTUP_FAILURE: undefined,
  SUCCESS: (
    <Tooltip title={'Pipeline succeeded'}>
      <Check />
    </Tooltip>
  ),
  TIMED_OUT: undefined,
  RUNNING: (
    <Tooltip title={'Pipeline running'}>
      <FindReplace />
    </Tooltip>
  ),
}
