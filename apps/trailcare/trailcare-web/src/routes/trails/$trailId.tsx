import { createFileRoute, Link } from '@tanstack/react-router'

import { useGetCareEntries, useGetTrail } from '@plusone/trailcare-api-client'

import { AppHeader } from '../../components/app-header'
import { Blaze } from '../../components/blaze'
import { CareEntryForm } from '../../components/care-entry-form'
import { CareLog } from '../../components/care-log'
import { BackIcon, BroomIcon } from '../../components/icons'
import { errorMessage } from '../../lib/api-error'
import { sweptLabel } from '../../lib/format'
import { useSession } from '../../lib/session'
import { useRecordCare } from '../../lib/use-record-care'

export const Route = createFileRoute('/trails/$trailId')({
  component: TrailPage,
})

function TrailPage() {
  const trailId = Number(Route.useParams().trailId)
  const { isAdmin } = useSession()
  const { data: trail, error } = useGetTrail(trailId)
  const { data: entries } = useGetCareEntries(trailId)
  const { sweepNow, isPending } = useRecordCare(trailId, trail?.name ?? '')

  const back = (
    <Link to="/" className="back-link" aria-label="Zurück zur Übersicht">
      <BackIcon className="back-icon" />
    </Link>
  )

  return (
    <div className="page">
      <AppHeader back={back} title={trail?.trailAreaName ?? ''} />
      <main className="content">
        {!!error && <p className="form-error">{errorMessage(error, 'Diesen Trail gibt es nicht (mehr).')}</p>}
        {trail && (
          <>
            <section className="trail-hero" data-status={trail.sweepStatus}>
              <Blaze status={trail.sweepStatus} value={trail.daysSinceSwept ?? '–'} size="large" />
              <div className="trail-hero-text">
                <h1>{trail.name}</h1>
                {trail.aliases.length > 0 && <p className="trail-aliases">auch {trail.aliases.join(', ')}</p>}
                <p className="trail-hero-status">{sweptLabel(trail.daysSinceSwept)}</p>
                <p className="hint">
                  Grün bis {days(trail.sweepGreenMaxDays)}, gelb bis {days(trail.sweepYellowMaxDays)} nach dem Fegen
                </p>
                {isAdmin && (
                  <Link to="/admin/trails/$trailId" params={{ trailId: String(trail.id) }} className="text-link">
                    Trail bearbeiten
                  </Link>
                )}
              </div>
            </section>

            <button className="button button-sweep" onClick={sweepNow} disabled={isPending}>
              <BroomIcon className="sweep-icon" />
              Heute gefegt
            </button>

            <details className="panel">
              <summary>Anderes Datum oder andere Arbeit eintragen</summary>
              <CareEntryForm trailId={trail.id} trailName={trail.name} />
            </details>

            <section>
              <h2 className="section-title">Pflegelog</h2>
              {entries && <CareLog entries={entries} />}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function days(count: number) {
  return count === 1 ? '1 Tag' : `${count} Tage`
}
