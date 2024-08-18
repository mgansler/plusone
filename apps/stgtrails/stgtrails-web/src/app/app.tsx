import { useEffect, useState } from 'react'

import { useValidatedTrailAreas } from '@plusone/stgtrails-api-client'

import { TrailArea } from './trail-area'

export function App() {
  const { data } = useValidatedTrailAreas({ query: {} })
  const [trailAreaId, setTrailAreaId] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (data && data.length > 0 && typeof trailAreaId !== 'number') {
      setTrailAreaId(data[0].id)
    }
  }, [data, trailAreaId])

  return (
    <div>
      <h1>Welcome stgtrails-web</h1>
      <select onChange={(event) => setTrailAreaId(Number(event.currentTarget.value))}>
        {data?.map((trailArea) => (
          <option key={trailArea.id} value={trailArea.id}>
            {trailArea.name}
          </option>
        ))}
      </select>

      {typeof trailAreaId === 'number' ? <TrailArea trailAreaId={trailAreaId} /> : null}
    </div>
  )
}
