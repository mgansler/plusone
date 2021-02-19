import React from 'react'
import { CheckConclusionState, Repository } from '@plusone/github-schema'

type RepositoryWithPRsProps = Repository

export const RepositoryWithPrs: React.FC<RepositoryWithPRsProps> = ({
  name,
  pullRequests: { totalCount: prCount, nodes },
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

  return (
    <div>
      {name} ({prCount} PRs): {prsWithSuccessfulCheck}|{prsWithFailedCheck}|
      {prsWithOtherCheckState}
    </div>
  )
}
