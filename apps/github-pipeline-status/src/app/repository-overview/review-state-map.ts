import { PullRequestReviewState } from '@plusone/github-schema'

export const ReviewStateMap: Record<PullRequestReviewState, string> = {
  APPROVED: '✅',
  CHANGES_REQUESTED: '❌',
  COMMENTED: '🗒',
  DISMISSED: '(-)',
  PENDING: '🕑',
}
