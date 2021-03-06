import { useMutation } from 'react-query'
import { Button } from '@material-ui/core'

import { PullRequest } from '@plusone/github-schema'

import { useOctokit } from '../octokit-provider/octokit-provider'

interface EnableAutoMergeProps {
  pullRequestId: PullRequest['id']
}

export function EnableAutoMerge({ pullRequestId }: EnableAutoMergeProps) {
  const octokit = useOctokit()
  const { mutate } = useMutation(['pr-approval'], () =>
    octokit.graphql(`
      mutation {
        enablePullRequestAutoMerge(input:{pullRequestId:"${pullRequestId}"}) {
          clientMutationId
        }
      }`),
  )

  const approve = () => {
    console.log('enable auto merge', { pullRequestId })
    mutate()
  }

  return <Button onClick={approve}>Enable Auto Merge</Button>
}
