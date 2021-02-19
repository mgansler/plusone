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
    <div>
      {name}
      {prCount > 0 ? (
        <React.Fragment>
          &nbsp;
          <a href={url + '/pulls'}>({prCount} PRs)</a>
          &nbsp;
          {`${prsWithSuccessfulCheck}\xa0\u2713\xa0|\xa0${prsWithFailedCheck}\xa0\u2717\xa0|\xa0${prsWithOtherCheckState}`}
        </React.Fragment>
      ) : (
        ''
      )}
    </div>
  )
}
