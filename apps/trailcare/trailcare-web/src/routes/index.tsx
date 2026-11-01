import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import type { TrailDto } from '@plusone/trailcare-api-client'
import { SweepStatus, useGetTrailAreas } from '@plusone/trailcare-api-client'

import { AppHeader } from '../components/app-header'
import { AreaToggle } from '../components/area-toggle'
import { SearchField } from '../components/search-field'
import { TrailRow } from '../components/trail-row'
import { errorMessage } from '../lib/api-error'
import { trailCount } from '../lib/format'
import { filterTrailAreas } from '../lib/search'
import { useSession } from '../lib/session'
import { useCollapsedAreas } from '../lib/use-collapsed-areas'

export const Route = createFileRoute('/')({
  component: HomePage,
})

/** What a collapsed area hides: how many trails and how many need sweeping */
function collapsedSummary(trails: Array<TrailDto>): string {
  const red = trails.filter((trail) => trail.sweepStatus === SweepStatus.RED).length
  return red > 0 ? `${trailCount(trails.length)} · ${red}× fegen nötig` : trailCount(trails.length)
}

function HomePage() {
  const { isAdmin } = useSession()
  const { data: areas, isLoading, error } = useGetTrailAreas({ query: { refetchInterval: 60_000 } })
  const [query, setQuery] = useState('')
  const result = useMemo(() => filterTrailAreas(areas ?? [], query), [areas, query])
  const { isCollapsed, toggle } = useCollapsedAreas('trailcare-collapsed-areas')
  const isSearching = query.trim().length > 0

  return (
    <div className="page">
      <AppHeader />
      <main className="content">
        <SearchField value={query} onChange={setQuery} placeholder="Trail suchen" label="Trail nach Name suchen" />

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

        {result.areas.map((area) => {
          // Search results are never hidden in a collapsed area
          const expanded = isSearching || !isCollapsed(area.id)
          const panelId = `area-${area.id}-trails`
          return (
            <section key={area.id} className="area">
              <AreaToggle
                name={area.name}
                expanded={expanded}
                controls={panelId}
                onToggle={() => toggle(area.id)}
                summary={collapsedSummary(area.trails)}
                disabled={isSearching}
              />
              <div id={panelId}>
                {!expanded ? null : area.trails.length === 0 ? (
                  <p className="hint">Noch keine Trails in diesem Gebiet.</p>
                ) : (
                  <ul className="trail-list">
                    {area.trails.map((trail) => (
                      <TrailRow
                        key={trail.id}
                        trail={trail}
                        matchedAlias={result.matches.get(trail.id)?.matchedAlias}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
