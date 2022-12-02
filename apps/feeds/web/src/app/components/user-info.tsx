import { Button, Typography } from '@mui/material'

import { useUserContext } from '../context/user'

export function UserInfo() {
  const { userInfo, logout } = useUserContext()

  if (userInfo === undefined) {
    return null
  }

  return (
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
      <Typography>{userInfo.username}</Typography>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}
