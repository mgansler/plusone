import { Link, Route, Routes } from 'react-router-dom'

import { DeviceDetails } from './device-details'
import { Devices } from './devices'
import { RoomDetails } from './room-details'
import { Rooms } from './rooms'

export function App() {
  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <div>
            <h1>Welcome to Elgato Control</h1>
            <Link to={'/devices'}>Click here to see all devices.</Link>
            <Link to={'/rooms'}>Click here to see all rooms.</Link>
          </div>
        }
      />
      <Route path={'devices'} element={<Devices />}>
        <Route path={':deviceId'} element={<DeviceDetails />} />
      </Route>
      <Route path={'rooms'} element={<Rooms />}>
        <Route path={':roomId'} element={<RoomDetails />} />
      </Route>
    </Routes>
  )
}
