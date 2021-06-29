import { Chip, IconButton, Tooltip, Typography } from '@material-ui/core'
import { Check, Error, MergeType, OpenInNew } from '@material-ui/icons'
import React from 'react'

import {
  AutoMergeRequest,
  MergeableState,
  PullRequest,
  PullRequestCommit,
  PullRequestReview,
  PullRequestReviewState,
  User,
} from '@plusone/github-schema'

import { useClassNames } from './repository-overview.styles'
import { CheckConclusionIconMap } from './check-conclusion-icon-map'
import { ApproveButton } from './approve-button'
import { EnableAutoMerge } from './enable-auto-merge'

const getLastReviewStatePerAuthor = (reviews: PullRequestReview[]): Record<string, PullRequestReviewState> =>
  reviews
    .filter(({ state }) => state !== PullRequestReviewState.Commented)
    .map((review) => ({
      author: (review.author as User).name ?? review.author.login,
      state: review.state,
    }))
    .reduce(
      (previousValue, current) => ({
        ...previousValue,
        [current.author]: current.state,
      }),
      {},
    )

const ReviewStateIconMap: Record<PullRequestReviewState, JSX.Element> = {
  APPROVED: (
    <Tooltip title={'Pull request approved'}>
      <Check />
    </Tooltip>
  ),
  CHANGES_REQUESTED: (
    <Tooltip title={'Changes requested'}>
      <Error />
    </Tooltip>
  ),
  COMMENTED: undefined,
  DISMISSED: undefined,
  PENDING: undefined,
}

interface CanBeMergedProps {
  className: HTMLDivElement['className']
  commits: PullRequestCommit[]
  mergeable: MergeableState
  autoMergeRequest: AutoMergeRequest
  pullRequestId: PullRequest['id']
}

function CanBeMerged({ className, commits, mergeable, autoMergeRequest, pullRequestId }: CanBeMergedProps) {
  const prCheckState = commits
    .flatMap((node) => node.commit.checkSuites.nodes)
    .flatMap((node) => node.conclusion)
    .pop()

  return mergeable === MergeableState.Conflicting ? (
    <div className={className}>
      <Typography variant={'caption'}>Merge Conflicts</Typography>
      <Tooltip title={'Merge conflicts'}>
        <Error />
      </Tooltip>
    </div>
  ) : (
    <div className={className}>
      <Typography variant={'caption'}>Workflows</Typography>
      {CheckConclusionIconMap[prCheckState ?? 'RUNNING']}
      {autoMergeRequest !== null ? (
        <Tooltip title={'Auto merge enabled'} children={<MergeType />} />
      ) : (
        <EnableAutoMerge pullRequestId={pullRequestId} />
      )}
    </div>
  )
}

interface PullRequestProps {
  pr: PullRequest
}

export function PullRequestRow({ pr }: PullRequestProps) {
  const classNames = useClassNames()
  const lastReviewStatePerAuthor = getLastReviewStatePerAuthor(pr.reviews.nodes)

  return (
    <div className={classNames.row}>
      <IconButton
        className={[classNames.linkColumn, classNames.pullRequestLink].join(' ')}
        href={pr.url}
        target={'_blank'}
        rel={'noreferrer'}
        onClick={(e) => e.stopPropagation()}
      >
        <OpenInNew />
      </IconButton>

      <Tooltip
        classes={{
          tooltip: classNames.draftTooltip,
          arrow: classNames.draftTooltipArrow,
        }}
        title={pr.isDraft ? 'Draft' : ''}
        arrow={true}
      >
        <Typography
          className={classNames.titleColumn}
          variant={'caption'}
          color={pr.isDraft ? 'textSecondary' : 'initial'}
        >
          {pr.title} by {(pr.author as User).name ?? pr.author.login}
        </Typography>
      </Tooltip>

      <CanBeMerged
        className={classNames.workflowColumn}
        commits={pr.commits.nodes}
        mergeable={pr.mergeable}
        autoMergeRequest={pr.autoMergeRequest}
        pullRequestId={pr.id}
      />

      <div className={classNames.pullRequestsOrReviewsColumn}>
        <ApproveButton pullRequestId={pr.id} />
        {Object.entries(lastReviewStatePerAuthor).map(([login, state]) => (
          <Chip key={login} label={login} icon={ReviewStateIconMap[state]} />
        ))}
      </div>
    </div>
  )
}
