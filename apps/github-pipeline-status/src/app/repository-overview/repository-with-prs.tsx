import React, { useMemo } from 'react'
import {
  CheckConclusionState,
  Commit,
  Repository,
} from '@plusone/github-schema'

import { PrDetails } from './pr-details'
import { CheckConclusionResult } from './check-conclusion-result'

export type UserFilter = 'all' | 'dependabot' | 'user'

interface RepositoryWithPrsProps {
  userFilter: UserFilter
  repository: Repository
}

export const RepositoryWithPrs: React.FC<RepositoryWithPrsProps> = ({
  userFilter,
  repository: {
    name,
    url,
    defaultBranchRef,
    pullRequests: { totalCount: prCount, nodes },
  },
}) => {
  const prCheckState = nodes
    .flatMap((node) => node.commits.nodes)
    .flatMap((node) => node.commit.checkSuites.nodes)
    .flatMap((node) => node.conclusion)

  const prsWithSuccessfulCheck = prCheckState.filter(
    (state) => state === CheckConclusionState.Success,
  ).length
  const prsWithFailedCheck = prCheckState.filter(
    (state) => state === CheckConclusionState.Failure,
  ).length
  const prsWithOtherCheckState = prCheckState.filter(
    (state) =>
      state !== CheckConclusionState.Success &&
      state !== CheckConclusionState.Failure,
  ).length

  const defaultBranchCheckConclusion = (defaultBranchRef.target as Commit).checkSuites.nodes
    .flatMap((node) => node.conclusion)
    .pop()

  const filteredPullRequests = useMemo(
    () =>
      nodes.filter((node) => {
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
    [nodes, userFilter],
  )

  return (
    <tr>
      <td>
        <a href={url}>{name}</a>
      </td>
      <td>
        {`${defaultBranchRef.name} ${
          CheckConclusionResult[defaultBranchCheckConclusion] ?? ''
        }`}
      </td>
      <td>{prCount > 0 ? <a href={url + '/pulls'}>{prCount} PRs</a> : ''}</td>
      <td>{prsWithSuccessfulCheck > 0 && prsWithSuccessfulCheck}</td>
      <td>{prsWithFailedCheck > 0 && prsWithFailedCheck}</td>
      <td>{prsWithOtherCheckState > 0 && prsWithOtherCheckState}</td>
      <td>
        <PrDetails pullRequest={filteredPullRequests} />
      </td>
    </tr>
  )
}
