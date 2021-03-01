import React, { useState } from 'react'
import {
  PullRequest,
  PullRequestReview,
  PullRequestReviewState,
} from '@plusone/github-schema'

import { CheckConclusionResult } from './check-conclusion-result'
import { useTableStyles } from './use-table-styles'
import { ReviewStateMap } from './review-state-map'

const getLastReviewStatePerAuthor = (
  reviews: PullRequestReview[],
): Record<string, PullRequestReviewState> =>
  reviews
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

interface PrDetailsProps {
  pullRequest: PullRequest[]
}

export const PrDetails: React.FC<PrDetailsProps> = ({ pullRequest }) => {
  const classNames = useTableStyles()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <React.Fragment>
      <button
        disabled={pullRequest.length === 0}
        onClick={() => setIsOpen((prevState) => !prevState)}
      >
        {isOpen ? 'Hide Details' : 'Show Details'}
      </button>
      {isOpen && pullRequest.length > 0 ? (
        <table className={classNames.table}>
          <colgroup>
            <col style={{ width: '60%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '30%' }} />
          </colgroup>

          <thead>
            <tr>
              <th>Title</th>
              <th>Pipeline</th>
              <th>Reviews</th>
            </tr>
          </thead>

          <tbody>
            {pullRequest.map((pr) => {
              const prCheckState = pr.commits.nodes
                .flatMap((node) => node.commit.checkSuites.nodes)
                .flatMap((node) => node.conclusion)
                .pop()

              const lastReviewStatePerAuthor = getLastReviewStatePerAuthor(
                pr.reviews.nodes,
              )
              const approvalStates = Object.entries(lastReviewStatePerAuthor)
                .map(([login, state]) => `${login}\xa0${ReviewStateMap[state]}`)
                .join(', ')

              return (
                <tr key={pr.number}>
                  <td>
                    <a href={pr.url} target={'_blank'} rel={'noreferrer'}>
                      {pr.title}
                    </a>
                    &nbsp;({pr.author.login})
                  </td>
                  <td className={classNames.center}>
                    {CheckConclusionResult[prCheckState]}
                  </td>
                  <td className={classNames.center}>{approvalStates}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}
    </React.Fragment>
  )
}
