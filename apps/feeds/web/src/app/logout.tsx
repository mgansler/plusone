import { Button } from '@material-ui/core'

import { useLogout, useUser } from '@plusone/feeds/web/login'

export function Logout() {
  const logout = useLogout()
  const user = useUser()

  return (
    <Button onClick={logout} variant={'outlined'} color={user.isAdmin ? 'secondary' : 'primary'}>
      Logout {user.username}
    </Button>
  )
}
