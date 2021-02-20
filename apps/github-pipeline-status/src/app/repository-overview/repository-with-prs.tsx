import React from 'react'
import { CheckConclusionState, Repository } from '@plusone/github-schema'

type RepositoryWithPRsProps = Repository

export const RepositoryWithPrs: React.FC<RepositoryWithPRsProps> = ({
  name,
  url,
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
    <tr>
      <td>{name}</td>
      <td>{prCount > 0 ? <a href={url + '/pulls'}>({prCount} PRs)</a> : ''}</td>
      <td>{prsWithSuccessfulCheck > 0 && prsWithSuccessfulCheck}</td>
      <td>{prsWithFailedCheck > 0 && prsWithFailedCheck}</td>
      <td>{prsWithOtherCheckState > 0 && prsWithOtherCheckState}</td>
    </tr>
  )
}
