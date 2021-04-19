import React, { useMemo } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  createStyles,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { Check, Error, ExpandMore, OpenInNew } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'

import {
  CheckConclusionState,
  Commit,
  MergeableState,
  PullRequestCommit,
  PullRequestReview,
  PullRequestReviewState,
  Ref,
  Repository,
  User,
} from '@plusone/github-schema'

import { UserFilter } from './repository-overview'

const useStyles = makeStyles((theme) =>
  createStyles({
    expanded: {},
    accordionRoot: {
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    accordionSummaryRoot: {
      minHeight: theme.spacing(6),
      '&$expanded': {
        minHeight: theme.spacing(6),
      },
    },
    accordionSummarySkeleton: {
      gap: theme.spacing(3),
    },
    accordionSummaryContent: {
      alignItems: 'center',
      margin: 0,
      '&$expanded': {
        margin: 0,
      },
    },
    accordionDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      maxHeight: theme.spacing(4.5),
    },
    linkColumn: {
      flexBasis: '5%',
    },
    pullRequestLink: {
      marginLeft: theme.spacing(1),
    },
    titleColumn: {
      flexBasis: '50%',
    },
    workflowColumn: {
      flexBasis: '20%',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    pullRequestsOrReviewsColumn: {
      flexBasis: '25%',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    draftTooltip: {
      color: theme.palette.warning.contrastText,
      backgroundColor: theme.palette.warning.light,
    },
    draftTooltipArrow: {
      color: theme.palette.warning.light,
    },
  }),
)

const CheckConclusionIconMap: Record<CheckConclusionState, JSX.Element> = {
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
}

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

const getLastReviewStatePerAuthor = (
  reviews: PullRequestReview[],
): Record<string, PullRequestReviewState> =>
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

interface CanBeMergedProps {
  className: HTMLDivElement['className']
  commits: PullRequestCommit[]
  mergeable: MergeableState
}

function CanBeMerged({ className, commits, mergeable }: CanBeMergedProps) {
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
      {CheckConclusionIconMap[prCheckState]}
    </div>
  )
}

interface DefaultBranchStateProps {
  className: HTMLDivElement['className']
  defaultBranchRef?: Ref
}

function DefaultBranchState({ className, defaultBranchRef }: DefaultBranchStateProps) {
  if (!defaultBranchRef) {
    return null
  }

  const defaultBranchCheckConclusion = (defaultBranchRef.target as Commit).checkSuites.nodes
    .flatMap((node) => node.conclusion)
    .pop()

  return (
    <div className={className}>
      <Typography>{defaultBranchRef.name}</Typography>
      {CheckConclusionIconMap[defaultBranchCheckConclusion]}
    </div>
  )
}

interface RepositoryAccordionProps {
  userFilter: UserFilter
  repository: Repository
}

export function RepositoryAccordion({
  userFilter,
  repository: {
    name,
    url,
    defaultBranchRef,
    pullRequests: { totalCount: pullRequestCount, nodes: pullRequests },
  },
}: RepositoryAccordionProps) {
  const classNames = useStyles()

  const filteredPullRequests = useMemo(
    () =>
      pullRequests.filter((node) => {
        switch (userFilter) {
          case 'all':
            return true
          case 'dependabot':
            return node.author.login === 'dependabot'
          case 'user':
            return node.author.login !== 'dependabot'
          default:
            return false
        }
      }),
    [pullRequests, userFilter],
  )

  return (
    <Accordion
      classes={{
        root: classNames.accordionRoot,
        expanded: classNames.expanded,
      }}
    >
      <AccordionSummary
        classes={{
          root: classNames.accordionSummaryRoot,
          content: classNames.accordionSummaryContent,
          expanded: classNames.expanded,
        }}
        expandIcon={<ExpandMore />}
      >
        <IconButton
          className={classNames.linkColumn}
          href={url}
          target={'_blank'}
          rel={'noreferrer'}
          onClick={(e) => e.stopPropagation()}
        >
          <OpenInNew />
        </IconButton>

        <div className={classNames.titleColumn}>
          <Typography>{name}</Typography>
        </div>

        <DefaultBranchState
          className={classNames.workflowColumn}
          defaultBranchRef={defaultBranchRef}
        />

        <div className={classNames.pullRequestsOrReviewsColumn}>
          {pullRequestCount > 0 && (
            <React.Fragment>
              <Typography>Open pull requests</Typography>
              <Button
                variant={'outlined'}
                href={url + '/pulls'}
                target={'_blank'}
                rel={'noreferrer'}
                onClick={(e) => e.stopPropagation()}
              >
                {pullRequestCount}
              </Button>
            </React.Fragment>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails className={classNames.accordionDetails}>
        {filteredPullRequests.map((pr) => {
          const lastReviewStatePerAuthor = getLastReviewStatePerAuthor(pr.reviews.nodes)

          return (
            <div className={classNames.row} key={pr.number}>
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
              />

              <div className={classNames.pullRequestsOrReviewsColumn}>
                {Object.entries(lastReviewStatePerAuthor).map(([login, state]) => (
                  <Chip key={login} label={login} icon={ReviewStateIconMap[state]} />
                ))}
              </div>
            </div>
          )
        })}
      </AccordionDetails>
    </Accordion>
  )
}

export function AccordionSkeleton() {
  const classNames = useStyles()

  return (
    <Accordion>
      <AccordionSummary
        classes={{ content: classNames.accordionSummarySkeleton }}
        expandIcon={<ExpandMore />}
      >
        <Skeleton variant={'circle'} width={28} height={28} />
        <Skeleton className={classNames.titleColumn} variant={'text'} />
        <Skeleton className={classNames.workflowColumn} variant={'text'} />
        <Skeleton className={classNames.pullRequestsOrReviewsColumn} variant={'text'} />
      </AccordionSummary>
    </Accordion>
  )
}
