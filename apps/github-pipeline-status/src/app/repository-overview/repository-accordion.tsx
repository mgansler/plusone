import React, { useMemo } from 'react'
import {
  CheckConclusionState,
  Commit,
  PullRequestReview,
  PullRequestReviewState,
  Repository,
} from '@plusone/github-schema'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  createStyles,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core'
import { Check, Error, ExpandMore, OpenInNew } from '@material-ui/icons'

import { UserFilter } from './repository-overview'

const useStyles = makeStyles((theme) =>
  createStyles({
    accordionSummaryContent: {
      alignItems: 'center',
    },
    accordionDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
    },
    linkColumn: {
      flexBasis: '5%',
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
  }),
)

const CheckConclusionIconMap: Record<CheckConclusionState, JSX.Element> = {
  ACTION_REQUIRED: undefined,
  CANCELLED: undefined,
  FAILURE: <Error />,
  NEUTRAL: undefined,
  SKIPPED: undefined,
  STALE: undefined,
  STARTUP_FAILURE: undefined,
  SUCCESS: <Check />,
  TIMED_OUT: undefined,
}

const ReviewStateIconMap: Record<PullRequestReviewState, JSX.Element> = {
  APPROVED: <Check />,
  CHANGES_REQUESTED: <Error />,
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
      author: review.author.login,
      state: review.state,
    }))
    .reduce(
      (previousValue, current) => ({
        ...previousValue,
        [current.author]: current.state,
      }),
      {},
    )

interface RepositoryAccordionProps {
  userFilter: UserFilter
  repository: Repository
}

export const RepositoryAccordion: React.FC<RepositoryAccordionProps> = ({
  userFilter,
  repository: {
    name,
    url,
    defaultBranchRef,
    pullRequests: { totalCount: pullRequestCount, nodes: pullRequests },
  },
}) => {
  const classNames = useStyles()

  const defaultBranchCheckConclusion = (defaultBranchRef.target as Commit).checkSuites.nodes
    .flatMap((node) => node.conclusion)
    .pop()

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
    <Accordion>
      <AccordionSummary
        classes={{ content: classNames.accordionSummaryContent }}
        expandIcon={<ExpandMore />}
      >
        <IconButton
          className={classNames.linkColumn}
          size={'small'}
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

        <div className={classNames.workflowColumn}>
          <Typography>{defaultBranchRef.name}</Typography>
          {CheckConclusionIconMap[defaultBranchCheckConclusion]}
        </div>

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
          const prCheckState = pr.commits.nodes
            .flatMap((node) => node.commit.checkSuites.nodes)
            .flatMap((node) => node.conclusion)
            .pop()

          const lastReviewStatePerAuthor = getLastReviewStatePerAuthor(
            pr.reviews.nodes,
          )

          return (
            <div className={classNames.row} key={pr.number}>
              <IconButton
                className={classNames.linkColumn}
                size={'small'}
                href={pr.url}
                target={'_blank'}
                rel={'noreferrer'}
                onClick={(e) => e.stopPropagation()}
              >
                <OpenInNew />
              </IconButton>
              <div className={classNames.titleColumn}>
                <Typography variant={'caption'}>
                  {pr.title} by {pr.author.login}
                </Typography>
              </div>
              <div className={classNames.workflowColumn}>
                <Typography variant={'caption'}>Workflow Actions</Typography>
                {CheckConclusionIconMap[prCheckState]}
              </div>
              <div className={classNames.pullRequestsOrReviewsColumn}>
                {Object.entries(lastReviewStatePerAuthor).map(
                  ([login, state]) => (
                    <Chip
                      key={login}
                      label={login}
                      icon={ReviewStateIconMap[state]}
                    />
                  ),
                )}
              </div>
            </div>
          )
        })}
      </AccordionDetails>
    </Accordion>
  )
}
