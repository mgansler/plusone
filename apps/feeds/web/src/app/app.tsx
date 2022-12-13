import type { Theme } from '@mui/material'
import { AppBar, Link as MuiLink, Toolbar, Typography } from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
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
import { FeedIdSettings } from './pages/member/feeds/$feedId.settings'
import { RecentArticles } from './pages/member/feeds/recent'
import { NewFeed } from './pages/member/new-feed'
import { Tags } from './pages/member/tags'

const useClassNames = makeStyles<Theme, object, 'appBar' | 'root' | 'toolbar'>((theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    root: {
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
      flexShrink: 1,
      overflowY: 'scroll',
    },
    toolbar: {
      gap: theme.spacing(1),
      justifyContent: 'space-between',
    },
  }),
)

export function App() {
  const classNames = useClassNames()

  const { isLoggedIn, userInfo } = useUserContext()

  return (
    <>
      <AppBar position={'sticky'} className={classNames.appBar}>
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

      <div className={classNames.root}>
        <Routes>
          <Route path={'home'} element={<Home />} />
          <Route path={'login'} element={<Login />} />
          <Route path={'register'} element={<Register />} />

          {isLoggedIn && (
            <Route path={'member'} element={<Member />}>
              <Route path={'new'} element={<NewFeed />} />
              <Route path={'feeds'} element={<FeedList />}>
                <Route path={':feedId/settings'} element={<FeedIdSettings />} />
                <Route path={'recent'} element={<RecentArticles />} />
                <Route path={':feedId'} element={<Articles />} />
              </Route>
              <Route path={'tags'} element={<Tags />} />
            </Route>
          )}

          {userInfo?.isAdmin && (
            <Route path={'admin'} element={<Admin />}>
              <Route path={'users'} element={<Users />} />
            </Route>
          )}
        </Routes>
      </div>
    </>
  )
}
