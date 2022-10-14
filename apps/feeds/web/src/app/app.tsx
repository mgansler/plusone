import { Link, Route, Routes } from 'react-router-dom'

import { Health } from './health'
import { Login } from './pages/login'
import { Register } from './pages/login/register'

export function App() {
  return (
    <>
      <h1>Welcome feeds-web</h1>
      <Health />
      <nav>
        <Link to={'/login'}>Login</Link>
      </nav>
      <Routes>
        <Route path={'/login'} element={<Login />} />
        <Route path={'/login/register'} element={<Register />} />
      </Routes>
    </>
  )
}

export default App
