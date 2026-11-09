import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import type { TrailDto } from '@plusone/trailcare-api-client'
import { useDeleteTrail, useGetTrail, useGetTrailAreas, useUpdateTrail } from '@plusone/trailcare-api-client'

import { SweepThresholdFields } from '../../../admin/sweep-threshold-fields'
import { useAdminMutationOptions } from '../../../admin/use-admin-mutation'
import { AppHeader } from '../../../components/app-header'
import { BackIcon } from '../../../components/icons'

export const Route = createFileRoute('/admin/trails/$trailId')({
  component: EditTrailPage,
})

function EditTrailPage() {
  const trailId = Number(Route.useParams().trailId)
  const { data: trail } = useGetTrail(trailId)
  const router = useRouter()

  const back = (
    <button
      type="button"
      className="back-link"
      aria-label="Zurück zur Verwaltung"
      onClick={() => router.history.back()}
    >
      <BackIcon className="back-icon" />
    </button>
  )

  return (
    <div className="page">
      <AppHeader back={back} title="Trail bearbeiten" />
      <main className="content">{trail && <EditTrailForm trail={trail} />}</main>
    </div>
  )
}

function EditTrailForm({ trail }: { trail: TrailDto }) {
  const navigate = useNavigate()
  const { data: areas } = useGetTrailAreas()
  const [name, setName] = useState(trail.name)
  const [trailAreaId, setTrailAreaId] = useState(trail.trailAreaId)
  const [aliases, setAliases] = useState(trail.aliases.join('\n'))
  // Without own thresholds the trail follows the global ones, which are shown as read-only values
  const [hasCustomThresholds, setHasCustomThresholds] = useState(trail.hasCustomSweepThresholds)
  const [green, setGreen] = useState(String(trail.sweepGreenMaxDays))
  const [yellow, setYellow] = useState(String(trail.sweepYellowMaxDays))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const timeout = window.setTimeout(() => setSaved(false), 2_000)
    return () => window.clearTimeout(timeout)
  }, [saved])

  const update = useUpdateTrail(useAdminMutationOptions(() => setSaved(true)))
  const remove = useDeleteTrail(useAdminMutationOptions(() => navigate({ to: '/admin' })))

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({
      trailId: trail.id,
      data: {
        name,
        trailAreaId,
        aliases: aliases
          .split('\n')
          .map((alias) => alias.trim())
          .filter(Boolean),
        sweepGreenMaxDays: hasCustomThresholds ? Number(green) : null,
        sweepYellowMaxDays: hasCustomThresholds ? Number(yellow) : null,
      },
    })
  }

  const onDelete = () => {
    if (window.confirm(`„${trail.name}“ mit dem ganzen Pflegelog löschen?`)) {
      remove.mutate({ trailId: trail.id })
    }
  }

  return (
    <form className="care-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
      </label>

      <label className="field">
        <span>Trailgebiet</span>
        <select value={trailAreaId} onChange={(event) => setTrailAreaId(Number(event.target.value))}>
          {areas?.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Weitere Namen, einer pro Zeile</span>
        <textarea rows={3} value={aliases} onChange={(event) => setAliases(event.target.value)} />
      </label>

      <fieldset className="field-group">
        <legend>Ampel nach dem Fegen</legend>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={hasCustomThresholds}
            onChange={(event) => setHasCustomThresholds(event.target.checked)}
          />
          <span>Eigene Werte für diesen Trail</span>
        </label>
        <SweepThresholdFields
          green={green}
          yellow={yellow}
          onGreenChange={setGreen}
          onYellowChange={setYellow}
          disabled={!hasCustomThresholds}
        />
        <p className="hint">
          {hasCustomThresholds
            ? 'Danach ist der Trail rot. Tag 0 ist der Tag, an dem gefegt wurde.'
            : 'Dieser Trail folgt den Werten für alle Trails, die in der Verwaltung eingestellt werden.'}
        </p>
      </fieldset>

      <div className="button-row">
        <button className="button button-primary" type="submit" disabled={update.isPending}>
          {saved ? 'Gespeichert' : 'Speichern'}
        </button>
        <Link to="/trails/$trailId" params={{ trailId: String(trail.id) }} className="button">
          Zum Pflegelog
        </Link>
        <button className="button button-danger" type="button" onClick={onDelete}>
          Trail löschen
        </button>
      </div>
    </form>
  )
}
