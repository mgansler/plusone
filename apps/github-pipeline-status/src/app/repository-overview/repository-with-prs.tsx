import React from 'react'
import {
  CheckConclusionState,
  Commit,
  Repository,
} from '@plusone/github-schema'

type RepositoryWithPRsProps = Repository

const CheckConclusionResult: Record<CheckConclusionState, string> = {
  ACTION_REQUIRED: '\u26a0',
  CANCELLED: '',
  FAILURE: '\u2717',
  NEUTRAL: '',
  SKIPPED: '',
  STALE: '',
  STARTUP_FAILURE: '',
  TIMED_OUT: '',
  SUCCESS: '\u2713',
}

export const RepositoryWithPrs: React.FC<RepositoryWithPRsProps> = ({
  name,
  url,
  defaultBranchRef,
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

  const defaultBranchCheckConclusion = (defaultBranchRef.target as Commit).checkSuites.nodes
    .flatMap((node) => node.conclusion)
    .pop()

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
      <td>{prCount > 0 ? <a href={url + '/pulls'}>({prCount} PRs)</a> : ''}</td>
      <td>{prsWithSuccessfulCheck > 0 && prsWithSuccessfulCheck}</td>
      <td>{prsWithFailedCheck > 0 && prsWithFailedCheck}</td>
      <td>{prsWithOtherCheckState > 0 && prsWithOtherCheckState}</td>
    </tr>
  )
}
