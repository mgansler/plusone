import { Link, Route, Routes } from 'react-router-dom'

import { UserInfo } from './components/user-info'
import { useUserContext } from './context/user'
import { Admin } from './pages/admin'
import { Home } from './pages/home'
import { Login } from './pages/login'
import { Register } from './pages/login/register'
import { Member } from './pages/member'

export function App() {
  const { isLoggedIn, userInfo } = useUserContext()

  return (
    <>
      <Link to={'/home'}>
        <h1>Welcome feeds-web</h1>
      </Link>
      <UserInfo />
      <nav>{!isLoggedIn && <Link to={'/login'}>Login</Link>}</nav>
      <Routes>
        <Route path={'/home'} element={<Home />} />
        <Route path={'/login'} element={<Login />} />
        <Route path={'/login/register'} element={<Register />} />
        {isLoggedIn && <Route path={'/member'} element={<Member />} />}
        {userInfo?.isAdmin && <Route path={'/admin'} element={<Admin />} />}
      </Routes>
    </>
  )
}
