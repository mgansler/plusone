import React, { useMemo } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Typography } from '@material-ui/core'
import { ExpandMore, OpenInNew } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'

import { Commit, Ref, Repository } from '@plusone/github-schema'

import { UserFilter } from './repository-overview'
import { useClassNames } from './repository-overview.styles'
import { PullRequestRow } from './pull-request-row'
import { CheckConclusion } from './check-conclusion'

interface DefaultBranchStateProps {
  className: HTMLDivElement['className']
  defaultBranchRef?: Ref
}

function DefaultBranchState({ className, defaultBranchRef }: DefaultBranchStateProps) {
  if (!defaultBranchRef) {
    return null
  }

  const checkSuite = (defaultBranchRef.target as Commit).checkSuites.nodes[
    (defaultBranchRef.target as Commit).checkSuites.nodes.length - 1
  ]

  return (
    <div className={className}>
      <Typography>{defaultBranchRef.name}</Typography>
      <CheckConclusion checkSuite={checkSuite} />
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
  const classNames = useClassNames()

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

        <DefaultBranchState className={classNames.workflowColumn} defaultBranchRef={defaultBranchRef} />

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
        {filteredPullRequests.map((pr) => (
          <PullRequestRow key={pr.id} pr={pr} />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export function AccordionSkeleton() {
  const classNames = useClassNames()

  return (
    <Accordion>
      <AccordionSummary classes={{ content: classNames.accordionSummarySkeleton }} expandIcon={<ExpandMore />}>
        <Skeleton variant={'circle'} width={28} height={28} />
        <Skeleton className={classNames.titleColumn} variant={'text'} />
        <Skeleton className={classNames.workflowColumn} variant={'text'} />
        <Skeleton className={classNames.pullRequestsOrReviewsColumn} variant={'text'} />
      </AccordionSummary>
    </Accordion>
  )
}
