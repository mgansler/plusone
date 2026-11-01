import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { useGetTrailAreas } from '@plusone/trailcare-api-client'

import { AccessPasswordAdmin } from '../../admin/access-password-admin'
import { CreateTrailAreaForm, TrailAreaAdmin } from '../../admin/trail-area-admin'
import { AppHeader } from '../../components/app-header'
import { BackIcon } from '../../components/icons'
import { SearchField } from '../../components/search-field'
import { filterTrailAreas } from '../../lib/search'
import { useCollapsedAreas } from '../../lib/use-collapsed-areas'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const { data: areas } = useGetTrailAreas()
  const [query, setQuery] = useState('')
  const result = useMemo(() => filterTrailAreas(areas ?? [], query), [areas, query])
  const { isCollapsed, toggle } = useCollapsedAreas('trailcare-admin-collapsed-areas')
  const isSearching = query.trim().length > 0

  const back = (
    <Link to="/" className="back-link" aria-label="Zurück zur Übersicht">
      <BackIcon className="back-icon" />
    </Link>
  )

  return (
    <div className="page">
      <AppHeader back={back} title="Verwaltung" />
      <main className="content">
        <section>
          <h2 className="section-title">Trailgebiete und Trails</h2>
          {areas && areas.length > 0 && (
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Gebiet oder Trail suchen"
              label="Gebiete und Trails durchsuchen"
            />
          )}
          {isSearching && result.areas.length === 0 && (
            <p className="hint">Kein Gebiet und kein Trail heißt „{query.trim()}“.</p>
          )}
          {result.areas.map((visible) => {
            // The filtered area only holds the matching trails, editing works on the full area
            const area = areas?.find((candidate) => candidate.id === visible.id) ?? visible
            return (
              <TrailAreaAdmin
                key={area.id}
                area={area}
                visibleTrails={visible.trails}
                expanded={isSearching || !isCollapsed(area.id)}
                onToggle={isSearching ? undefined : () => toggle(area.id)}
              />
            )
          })}
          {!isSearching && <CreateTrailAreaForm />}
        </section>

        <section>
          <h2 className="section-title">Zugangspasswörter</h2>
          <AccessPasswordAdmin />
        </section>
      </main>
    </div>
  )
}
