import React from 'react'
import { useQuery } from 'react-query'
import { useOctokit } from './octokit-provider/octokit-provider'

export const App: React.FC = () => {
  const octokit = useOctokit()
  const { data, isLoading, error } = useQuery('test', async () => {
    return await octokit.graphql(`
      query {
        viewer {
          login
          location
        }
      }
    `)
  })

  console.log(data, isLoading, error)

  return (
    <React.Fragment>
      <h1>Welcome to github-pipeline-status!</h1>
    </React.Fragment>
  )
}
