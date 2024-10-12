import { useEffect, useState } from 'react'

import { useValidatedTrailAreas } from '@plusone/stgtrails-api-client'

import { TrailArea } from './trail-area'

export function App() {
  const { data: trailAreas } = useValidatedTrailAreas()
  const [trailAreaId, setTrailAreaId] = useState<number | undefined>(undefined)
  const [hours, setHours] = useState<number>(96)

  useEffect(() => {
    if (trailAreas && trailAreas.length > 0 && typeof trailAreaId !== 'number') {
      setTrailAreaId(trailAreas[0].id)
    }
  }, [trailAreas, trailAreaId])

  if (!trailAreas) {
    return (
      <>
        <h1>Welcome stgtrails-web</h1>
        <div>Please wait until the data is loaded.</div>
      </>
    )
  }

  return (
    <div>
      <h1>Welcome stgtrails-web</h1>
      <label>
        Trail Area
        <select onChange={(event) => setTrailAreaId(Number(event.currentTarget.value))}>
          {trailAreas?.map((trailArea) => (
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

      {typeof trailAreaId === 'number' ? (
        <TrailArea
          trailAreaId={trailAreaId}
          threshold={trailAreas.find((trailArea) => trailArea.id === trailAreaId)?.threshold}
          hours={hours}
          key={hours}
        />
      ) : null}
    </div>
  )
}
