import { CheckConclusionState } from '@plusone/github-schema'

export const CheckConclusionResult: Record<CheckConclusionState, string> = {
  ACTION_REQUIRED: '\u26a0',
  CANCELLED: '',
  FAILURE: '\u2717',
  NEUTRAL: '',
  SKIPPED: '',
  STALE: '',
  STARTUP_FAILURE: '',
  TIMED_OUT: '',
  SUCCESS: '\u2713',
}
