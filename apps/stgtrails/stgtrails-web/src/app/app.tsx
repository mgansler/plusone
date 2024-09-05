import { useEffect, useState } from 'react'

import { useValidatedTrailAreas } from '@plusone/stgtrails-api-client'

import { TrailArea } from './trail-area'

export function App() {
  const { data } = useValidatedTrailAreas({ query: {} })
  const [trailAreaId, setTrailAreaId] = useState<number | undefined>(undefined)
  const [hours, setHours] = useState<number>(96)

  useEffect(() => {
    if (data && data.length > 0 && typeof trailAreaId !== 'number') {
      setTrailAreaId(data[0].id)
    }
  }, [data, trailAreaId])

  return (
    <div>
      <h1>Welcome stgtrails-web</h1>
      <label>
        Trail Area
        <select onChange={(event) => setTrailAreaId(Number(event.currentTarget.value))}>
          {data?.map((trailArea) => (
            <option key={trailArea.id} value={trailArea.id}>
              {trailArea.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Past days
        <select onChange={(event) => setHours(Number(event.currentTarget.value))}>
          {[1, 2, 3, 4, 5, 6, 7].map((days) => (
            <option key={days} value={days * 24 + 72}>
              {days} day{days > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>

      {typeof trailAreaId === 'number' ? <TrailArea trailAreaId={trailAreaId} hours={hours} key={hours} /> : null}
    </div>
  )
}
