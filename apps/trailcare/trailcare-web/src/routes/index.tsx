import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useGetTrailAreas } from '@plusone/trailcare-api-client'

import { AppHeader } from '../components/app-header'
import { SearchIcon } from '../components/icons'
import { TrailRow } from '../components/trail-row'
import { errorMessage } from '../lib/api-error'
import { filterTrailAreas } from '../lib/search'
import { useSession } from '../lib/session'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { isAdmin } = useSession()
  const { data: areas, isLoading, error } = useGetTrailAreas({ query: { refetchInterval: 60_000 } })
  const [query, setQuery] = useState('')
  const result = useMemo(() => filterTrailAreas(areas ?? [], query), [areas, query])

  return (
    <div className="page">
      <AppHeader />
      <main className="content">
        <div className="search">
          <SearchIcon className="search-icon" />
          <input
            type="search"
            placeholder="Trail suchen"
            aria-label="Trail nach Name suchen"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {isLoading && <p className="hint">Trails werden geladen …</p>}
        {!!error && <p className="form-error">{errorMessage(error)}</p>}

        {areas && areas.length === 0 && (
          <div className="empty">
            <p>Es gibt noch keine Trails.</p>
            <p className="hint">
              {isAdmin
                ? 'Leg in der Verwaltung ein Trailgebiet mit Trails an.'
                : 'Ein Admin muss zuerst Trails anlegen.'}
            </p>
          </div>
        )}

        {areas && areas.length > 0 && result.areas.length === 0 && (
          <p className="hint">Kein Trail heißt „{query.trim()}“. Probier einen anderen Namen.</p>
        )}

        {result.areas.map((area) => (
          <section key={area.id} className="area">
            <h2 className="area-name">{area.name}</h2>
            {area.trails.length === 0 ? (
              <p className="hint">Noch keine Trails in diesem Gebiet.</p>
            ) : (
              <ul className="trail-list">
                {area.trails.map((trail) => (
                  <TrailRow key={trail.id} trail={trail} matchedAlias={result.matches.get(trail.id)?.matchedAlias} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}
