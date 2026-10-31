import { Link } from '@tanstack/react-router'
import type { FormEvent } from 'react'
import { useState } from 'react'

import type { TrailAreaDto } from '@plusone/trailcare-api-client'
import {
  useCreateTrail,
  useCreateTrailArea,
  useDeleteTrailArea,
  useUpdateTrailArea,
} from '@plusone/trailcare-api-client'

import { Blaze } from '../components/blaze'

import { useAdminMutationOptions } from './use-admin-mutation'

export function CreateTrailAreaForm() {
  const [name, setName] = useState('')
  const { mutate, isPending } = useCreateTrailArea(useAdminMutationOptions(() => setName('')))

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutate({ data: { name } })
  }

  return (
    <form className="inline-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Neues Trailgebiet</span>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
      </label>
      <button className="button button-primary" type="submit" disabled={isPending || !name.trim()}>
        Anlegen
      </button>
    </form>
  )
}

export function TrailAreaAdmin({ area }: { area: TrailAreaDto }) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [name, setName] = useState(area.name)
  const [trailName, setTrailName] = useState('')

  const update = useUpdateTrailArea(useAdminMutationOptions(() => setIsRenaming(false)))
  const remove = useDeleteTrailArea(useAdminMutationOptions())
  const createTrail = useCreateTrail(useAdminMutationOptions(() => setTrailName('')))

  const onRename = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({ trailAreaId: area.id, data: { name } })
  }

  const onDelete = () => {
    const trails = area.trails.length
    const question =
      trails > 0
        ? `„${area.name}“ mit ${trails === 1 ? 'einem Trail' : `${trails} Trails`} und dem ganzen Pflegelog löschen?`
        : `„${area.name}“ löschen?`
    if (window.confirm(question)) {
      remove.mutate({ trailAreaId: area.id })
    }
  }

  const onCreateTrail = (event: FormEvent) => {
    event.preventDefault()
    createTrail.mutate({ trailAreaId: area.id, data: { name: trailName } })
  }

  return (
    <section className="admin-area">
      {isRenaming ? (
        <form className="inline-form" onSubmit={onRename}>
          <label className="field">
            <span>Name des Trailgebiets</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required autoFocus />
          </label>
          <div className="button-row">
            <button className="button button-primary" type="submit" disabled={update.isPending}>
              Speichern
            </button>
            <button
              className="button"
              type="button"
              onClick={() => {
                setName(area.name)
                setIsRenaming(false)
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-area-head">
          <h3 className="area-name">{area.name}</h3>
          <div className="button-row">
            <button className="text-button" onClick={() => setIsRenaming(true)}>
              Umbenennen
            </button>
            <button className="text-button text-button-danger" onClick={onDelete}>
              Löschen
            </button>
          </div>
        </div>
      )}

      <ul className="admin-trails">
        {area.trails.map((trail) => (
          <li key={trail.id}>
            <Link to="/admin/trails/$trailId" params={{ trailId: String(trail.id) }} className="admin-trail-link">
              <Blaze status={trail.sweepStatus} />
              <span className="admin-trail-name">{trail.name}</span>
              {trail.aliases.length > 0 && <span className="hint">auch {trail.aliases.join(', ')}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <form className="inline-form" onSubmit={onCreateTrail}>
        <label className="field">
          <span>Trail hinzufügen</span>
          <input value={trailName} onChange={(event) => setTrailName(event.target.value)} maxLength={100} required />
        </label>
        <button className="button" type="submit" disabled={createTrail.isPending || !trailName.trim()}>
          Hinzufügen
        </button>
      </form>
    </section>
  )
}
