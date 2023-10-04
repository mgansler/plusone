import { useNavigate } from '@remix-run/react'
import type { ReactEventHandler } from 'react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useValidatedGroupList } from '@plusone/elgato-api-client'

export function GroupList() {
  const navigate = useNavigate()
  const location = useLocation()

  const { data, isLoading } = useValidatedGroupList()

  useEffect(() => {
    if (location.pathname === '/groups' && !isLoading && data.groups.length > 0) {
      navigate(`/groups/${data.groups[0].id}`)
    }
  }, [data?.groups, isLoading, location.pathname, navigate])

  const onSelectChange: ReactEventHandler<HTMLSelectElement> = (event) => {
    navigate(event.currentTarget.value)
  }

  const selectDefaultValue = (): number => {
    // This will return ['/groups/x', 'x'] when it matches, where x is the groupId
    const matches = location.pathname.match(/\/groups\/(\d)+/)
    if (matches?.length > 1) {
      return Number(matches[1])
    }
    return 0
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      <select onChange={onSelectChange} defaultValue={selectDefaultValue()}>
        {data.groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      <Outlet />
    </>
  )
}
