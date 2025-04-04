import { Check, Error, MergeType, OpenInNew } from '@mui/icons-material'
import { Chip, IconButton, Tooltip, Typography, useTheme } from '@mui/material'
import React from 'react'

import type {
  AutoMergeRequestFieldsFragment,
  PullRequest,
  PullRequestCommit,
  PullRequestReview,
  PullRequestsFieldsFragment,
  User,
} from '@plusone/github-schema'
import { MergeableState, PullRequestReviewState } from '@plusone/github-schema'

import { ApproveButton } from './approve-button'
import { CheckConclusion } from './check-conclusion'
import { EnableAutoMerge } from './enable-auto-merge'

const UNKNOWN_USER = 'unknown user'

const getLastReviewStatePerAuthor = (reviews: Array<PullRequestReview>): Record<string, PullRequestReviewState> => {
  return reviews
    .filter(({ state }) => state !== PullRequestReviewState.Commented)
    .map((review) => ({
      author: (review.author as User).name ?? (review.author as User).login ?? UNKNOWN_USER,
      state: review.state,
    }))
    .reduce(
      (previousValue, current) => ({
        ...previousValue,
        [current.author]: current.state,
      }),
      {},
    )
}

const ReviewStateIconMap: Record<PullRequestReviewState, React.JSX.Element | undefined> = {
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

type CanBeMergedProps = {
  commits: Array<PullRequestCommit>
  mergeable: MergeableState
  autoMergeRequest?: AutoMergeRequestFieldsFragment | null
  pullRequestId: PullRequest['id']
  pullRequestUrl: PullRequest['url']
}

function CanBeMerged({ commits, mergeable, autoMergeRequest, pullRequestId, pullRequestUrl }: CanBeMergedProps) {
  const theme = useTheme()
  const checkSuites = commits.flatMap((node) => node.commit.checkSuites?.nodes)
  const checkSuite = checkSuites[checkSuites.length - 1]

  return mergeable === MergeableState.Conflicting ? (
    <div
      style={{
        flexBasis: '20%',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
      }}
    >
      <Typography variant={'caption'}>Merge Conflicts</Typography>
      <IconButton
        href={pullRequestUrl}
        target={'_blank'}
        rel={'noreferrer'}
        onClick={(e) => e.stopPropagation()}
        size={'large'}
      >
        <Tooltip title={'Merge conflicts'}>
          <Error />
        </Tooltip>
      </IconButton>
    </div>
  ) : (
    <div
      style={{
        flexBasis: '20%',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
      }}
    >
      <Typography variant={'caption'}>Workflows</Typography>
      <CheckConclusion checkSuite={checkSuite} />
      {autoMergeRequest !== null ? (
        <Tooltip title={'Auto merge enabled'} children={<MergeType />} />
      ) : (
        <EnableAutoMerge pullRequestId={pullRequestId} />
      )}
    </div>
  )
}

type PullRequestProps = {
  pr: PullRequestsFieldsFragment
}

export function PullRequestRow({ pr }: PullRequestProps) {
  const theme = useTheme()
  const lastReviewStatePerAuthor = getLastReviewStatePerAuthor(pr.reviews?.nodes as Array<PullRequestReview>)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        maxHeight: theme.spacing(4.5),
      }}
    >
      <IconButton
        sx={{
          flexBasis: '5%',
          marginLeft: theme.spacing(1),
        }}
        href={pr.url}
        target={'_blank'}
        rel={'noreferrer'}
        onClick={(e) => e.stopPropagation()}
        size={'large'}
      >
        <OpenInNew />
      </IconButton>

      <Tooltip
        sx={{
          '& .MuiTooltip-tooltip': {
            color: theme.palette.warning.contrastText,
            backgroundColor: theme.palette.warning.light,
          },
          '& .MuiTooltip-arrow': {
            color: theme.palette.warning.light,
          },
        }}
        title={pr.isDraft ? 'Draft' : ''}
        arrow={true}
      >
        <Typography sx={{ flexBasis: '50%' }} variant={'caption'} color={pr.isDraft ? 'textSecondary' : ''}>
          {pr.title} by {(pr.author as User).name ?? (pr.author as User).login ?? UNKNOWN_USER}
        </Typography>
      </Tooltip>

      <CanBeMerged
        commits={pr.commits.nodes as Array<PullRequestCommit>}
        mergeable={pr.mergeable}
        autoMergeRequest={pr.autoMergeRequest}
        pullRequestId={pr.id}
        pullRequestUrl={pr.url}
      />

      <div
        style={{
          flexBasis: '25%',
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <ApproveButton pullRequestId={pr.id} />
        {Object.entries(lastReviewStatePerAuthor).map(([login, state]) => (
          <Chip key={login} label={login} icon={ReviewStateIconMap[state]} />
        ))}
      </div>
    </div>
  )
}
