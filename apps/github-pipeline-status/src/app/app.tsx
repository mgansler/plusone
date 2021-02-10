import React from 'react'
import { UserInfo } from './user-info/user-info'

export const App: React.FC = () => {
  return (
    <React.Fragment>
      <h1>Welcome to github-pipeline-status!</h1>
      <UserInfo />
    </React.Fragment>
  )
}
