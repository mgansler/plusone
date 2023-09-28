import { Link, Outlet } from 'react-router-dom'

import { useValidatedListRooms } from '@plusone/elgato-api-client'

import { RoomCreate } from './room-create'

export function Rooms() {
  const { data, isLoading } = useValidatedListRooms()

  if (isLoading) {
    return 'loading...'
  }

  return (
    <>
      <Link to={'/'}>Click here to go back to the landing page.</Link>

      <RoomCreate />

      <ul>
        {data!.rooms.map((room) => (
          <li key={room.id}>
            <Link to={`/rooms/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>

      <Outlet />
    </>
  )
}
