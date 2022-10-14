import { Link, Route, Routes } from 'react-router-dom'

import { UserInfo } from './components/user-info'
import { useUserContext } from './context/user'
import { Health } from './health'
import { Login } from './pages/login'
import { Register } from './pages/login/register'

export function App() {
  const { isLoggedIn } = useUserContext()

  return (
    <>
      <h1>Welcome feeds-web</h1>
      <UserInfo />
      <Health />
      <nav>{!isLoggedIn && <Link to={'/login'}>Login</Link>}</nav>
      <Routes>
        <Route path={'/login'} element={<Login />} />
        <Route path={'/login/register'} element={<Register />} />
      </Routes>
    </>
  )
}
