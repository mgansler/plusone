import { IconButton, Tooltip } from '@material-ui/core'
import React from 'react'
import { Check, Error, FindReplace } from '@material-ui/icons'

import { CheckConclusionState, CheckSuite } from '@plusone/github-schema'

const CheckConclusionIconMap: Record<CheckConclusionState | 'RUNNING', JSX.Element> = {
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

interface CheckConclusionProps {
  checkSuite?: CheckSuite
}

export function CheckConclusion({ checkSuite }: CheckConclusionProps) {
  return (
    <IconButton
      href={checkSuite?.resourcePath ? 'https://github.com' + checkSuite.resourcePath : undefined}
      target={'_blank'}
      rel={'noreferrer'}
      onClick={(e) => e.stopPropagation()}
    >
      {CheckConclusionIconMap[checkSuite.conclusion ?? 'RUNNING']}
    </IconButton>
  )
}
