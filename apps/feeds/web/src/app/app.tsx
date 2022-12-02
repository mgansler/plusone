import type { Theme } from '@mui/material'
import { AppBar, Link as MuiLink, Toolbar, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import { UserInfo } from './components/user-info'
import { useUserContext } from './context/user'
import { Admin } from './pages/admin'
import { Users } from './pages/admin/users'
import { Home } from './pages/home'
import { Login } from './pages/login'
import { Register } from './pages/login/register'
import { Member } from './pages/member'
import { FeedList } from './pages/member/feeds'
import { Articles } from './pages/member/feeds/$feedId'
import { NewFeed } from './pages/member/new-feed'

const useClassNames = makeStyles<Theme, object, 'toolbar' | 'main'>((theme) =>
  createStyles({
    toolbar: {
      gap: theme.spacing(1),
      justifyContent: 'space-between',
    },
    main: {
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
      height: '100vh',
    },
  }),
)

export function App() {
  const classNames = useClassNames()

  const { isLoggedIn, userInfo } = useUserContext()

  return (
    <>
      <AppBar position={'static'}>
        <Toolbar className={classNames.toolbar}>
          <Typography variant={'h6'}>Feeds</Typography>

          {isLoggedIn ? (
            <UserInfo />
          ) : (
            <MuiLink component={Link} to={'/login'}>
              Login
            </MuiLink>
          )}
        </Toolbar>
      </AppBar>

      <main className={classNames.main}>
        <Routes>
          <Route path={'home'} element={<Home />} />
          <Route path={'login'} element={<Login />} />
          <Route path={'register'} element={<Register />} />

          {isLoggedIn && (
            <Route path={'member'} element={<Member />}>
              <Route path={'new'} element={<NewFeed />} />
              <Route path={'feeds'} element={<FeedList />}>
                <Route path={':feedId'} element={<Articles />} />
              </Route>
            </Route>
          )}

          {userInfo?.isAdmin && (
            <Route path={'admin'} element={<Admin />}>
              <Route path={'users'} element={<Users />} />
            </Route>
          )}
        </Routes>
      </main>
    </>
  )
}
