import { useNavigate } from '@remix-run/react'
import type { ReactEventHandler } from 'react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('devices')
    }
  }, [location.pathname, navigate])

  const onSelectChange: ReactEventHandler<HTMLSelectElement> = (event) => {
    navigate(event.currentTarget.value)
  }

  const selectDefaultValue = (): string => {
    if (['/', '/devices'].includes(location.pathname)) {
      return 'devices'
    }
    return 'groups'
  }

  return (
    <>
      <h1>Welcome to Elgato Control</h1>

      <select onChange={onSelectChange} defaultValue={selectDefaultValue()}>
        <option value={'devices'}>Devices</option>
        <option value={'groups'}>Groups</option>
      </select>

      <Outlet />

      {!location.pathname.includes('settings') ? <button onClick={() => navigate('/settings')}>Settings</button> : null}
    </>
  )
}
