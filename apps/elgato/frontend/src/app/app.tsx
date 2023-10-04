import type { ReactEventHandler } from 'react'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useValidatedListGroups } from '@plusone/elgato-api-client'

export function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const { data, isLoading } = useValidatedListGroups()

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/all')
    }
  }, [location.pathname, navigate])

  if (isLoading) {
    return null
  }

  const selectGroup: ReactEventHandler<HTMLSelectElement> = (event) => {
    navigate(event.currentTarget.value)
  }

  return (
    <>
      <h1>Welcome to Elgato Control</h1>
      <select onChange={selectGroup} defaultValue={location.pathname.replace('/', '')}>
        <option value={'all'}>All</option>
        {data.groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
        <option value={'new'}>New</option>
      </select>

      <Outlet />
    </>
  )
}
