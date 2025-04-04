import { ExpandMore, OpenInNew } from '@mui/icons-material'
import type { SkeletonOwnProps } from '@mui/material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useMemo } from 'react'

import type {
  Commit,
  DefaultBranchRefFieldsFragment,
  PullRequest,
  RepositoryFieldsFragment,
} from '@plusone/github-schema'

import { CheckConclusion } from './check-conclusion'
import { PullRequestRow } from './pull-request-row'
import type { UserFilter } from './repository-overview'

type DefaultBranchStateProps = {
  defaultBranchRef?: DefaultBranchRefFieldsFragment
}

function DefaultBranchState({ defaultBranchRef }: DefaultBranchStateProps) {
  const theme = useTheme()
  if (
    typeof defaultBranchRef === 'undefined' ||
    defaultBranchRef.target?.__typename !== 'Commit' ||
    !Array.isArray(defaultBranchRef.target.checkSuites?.nodes)
  ) {
    return null
  }

  const commit = defaultBranchRef.target as Commit
  if (!commit.checkSuites || !commit.checkSuites.nodes) {
    return null
  }

  const checkSuite = commit.checkSuites.nodes[commit.checkSuites.nodes.length - 1]

  return (
    <div
      style={{
        flexBasis: '20%',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
      }}
    >
      <Typography>{defaultBranchRef.name}</Typography>
      <CheckConclusion checkSuite={checkSuite} />
    </div>
  )
}

type RepositoryAccordionProps = {
  userFilter: UserFilter
  repository: RepositoryFieldsFragment
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
  const theme = useTheme()

  const filteredPullRequests = useMemo(
    () =>
      (pullRequests as Array<PullRequest>).filter((node) => {
        switch (userFilter) {
          case 'all':
            return true
          case 'dependabot':
            return node?.author?.login === 'dependabot'
          case 'user':
            return node?.author?.login !== 'dependabot'
          default:
            return false
        }
      }),
    [pullRequests, userFilter],
  )

  return (
    <Accordion
      sx={{
        '& .MuiAccordion-root': {
          '&:before': {
            display: 'none',
          },
          '& .Mui-expanded': {
            margin: 'auto',
          },
        },
      }}
    >
      <AccordionSummary
        sx={{
          '& .MuiAccordionSummary-root': {
            minHeight: theme.spacing(6),
          },
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            margin: 0,
          },
        }}
        expandIcon={<ExpandMore />}
      >
        <IconButton
          sx={{
            flexBasis: '5%',
          }}
          href={url}
          target={'_blank'}
          rel={'noreferrer'}
          onClick={(e) => e.stopPropagation()}
          size={'large'}
        >
          <OpenInNew />
        </IconButton>

        <div style={{ flexBasis: '50%' }}>
          <Typography>{name}</Typography>
        </div>

        {defaultBranchRef ? <DefaultBranchState defaultBranchRef={defaultBranchRef} /> : null}

        <div
          style={{
            flexBasis: '25%',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
        >
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
      <AccordionDetails
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {filteredPullRequests.map((pr) => (
          <PullRequestRow key={pr.id} pr={pr} />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export function AccordionSkeleton() {
  const theme = useTheme()

  return (
    <Accordion>
      <AccordionSummary
        sx={{
          '& .MuiAccordionSummary-content': { gap: theme.spacing(3) },
        }}
        expandIcon={<ExpandMore />}
      >
        <Skeleton variant={'circular' as SkeletonOwnProps['variant']} width={28} height={28} />
        <Skeleton sx={{ flexBasis: '50%' }} variant={'text' as SkeletonOwnProps['variant']} />
        <Skeleton
          sx={{
            flexBasis: '20%',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
          variant={'text' as SkeletonOwnProps['variant']}
        />
        <Skeleton
          sx={{
            flexBasis: '25%',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
          variant={'text' as SkeletonOwnProps['variant']}
        />
      </AccordionSummary>
    </Accordion>
  )
}
