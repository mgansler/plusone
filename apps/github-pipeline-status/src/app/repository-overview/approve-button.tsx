import { Button } from '@mui/material'
import { useMutation } from '@tanstack/react-query'

import type { PullRequest } from '@plusone/github-schema'
import { ApprovePullRequestDocument } from '@plusone/github-schema'

import { useOctokit } from '../octokit-provider/octokit-provider'

interface ApproveButtonProps {
  pullRequestId: PullRequest['id']
}

export function ApproveButton({ pullRequestId }: ApproveButtonProps) {
  const octokit = useOctokit()
  const { mutate } = useMutation(['pr-approval'], () => octokit.graphql(ApprovePullRequestDocument, { pullRequestId }))

  const approve = () => {
    console.log('approve', { pullRequestId })
    mutate()
  }

  return <Button onClick={approve}>Approve</Button>
}
