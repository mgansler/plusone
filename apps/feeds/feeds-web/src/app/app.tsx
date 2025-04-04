import { AppBar, Container, Link as MuiLink, Toolbar, Typography, useTheme } from '@mui/material'
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

export function App() {
  const theme = useTheme()

  const { isLoggedIn, userInfo } = useUserContext()

  return (
    <>
      <AppBar position={'sticky'} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar
          sx={{
            gap: theme.spacing(1),
            justifyContent: 'space-between',
          }}
        >
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

      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing(1),
          gap: theme.spacing(1),
          flexShrink: 1,
          overflowX: 'scroll',
        }}
      >
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
      </Container>
    </>
  )
}
