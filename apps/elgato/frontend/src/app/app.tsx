import { Link, Route, Routes } from 'react-router-dom'

import { Devices } from './devices'

export function App() {
  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <div>
            <h1>Welcome to Elgato Control</h1>
            <Link to={'/devices'}>Click here to see all devices.</Link>
          </div>
        }
      />
      <Route path={'/devices'} element={<Devices />} />
    </Routes>
  )
}
