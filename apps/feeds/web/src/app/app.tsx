import { CssBaseline } from '@mui/material'
import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import { DarkModeThemeProvider } from '@plusone/dark-mode-theme-provider'

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

export function App() {
  const { isLoggedIn, userInfo } = useUserContext()

  return (
    <DarkModeThemeProvider>
      <CssBaseline />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to={'/home'}>
          <h1>Welcome feeds-web</h1>
        </Link>
        <UserInfo />
      </div>

      <nav>{!isLoggedIn && <Link to={'/login'}>Login</Link>}</nav>

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
    </DarkModeThemeProvider>
  )
}
