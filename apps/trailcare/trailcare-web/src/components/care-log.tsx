import { useQueryClient } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useState } from 'react'

import type { CareEntryDto, CareType } from '@plusone/trailcare-api-client'
import { deleteCareEntry, useUpdateCareEntry } from '@plusone/trailcare-api-client'

import { errorMessage } from '../lib/api-error'
import { CARE_TYPE_LABEL, CARE_TYPES } from '../lib/care-types'
import { formatDate, performedAtForDay, toDayKey } from '../lib/format'
import { useSession } from '../lib/session'

import { useUndo } from './undo-toast'

export function CareLog({ entries }: { entries: Array<CareEntryDto> }) {
  if (entries.length === 0) {
    return <p className="hint">Noch keine Einträge. Trag ein, was du am Trail gemacht hast.</p>
  }

  return (
    <ol className="care-log">
      {entries.map((entry) => (
        <CareLogItem key={entry.id} entry={entry} />
      ))}
    </ol>
  )
}

function CareLogItem({ entry }: { entry: CareEntryDto }) {
  const { isAdmin } = useSession()
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <li className="care-log-item" data-type={entry.type}>
        <CareEntryEditor entry={entry} onDone={() => setIsEditing(false)} />
      </li>
    )
  }

  return (
    <li className="care-log-item" data-type={entry.type}>
      <div className="care-log-head">
        <span className="care-log-type">{CARE_TYPE_LABEL[entry.type]}</span>
        <time dateTime={entry.performedAt}>{formatDate(entry.performedAt)}</time>
      </div>
      {entry.comment && <p className="care-log-comment">{entry.comment}</p>}
      {entry.performedBy && <p className="care-log-by">{entry.performedBy}</p>}
      {isAdmin && (
        <button className="text-button" onClick={() => setIsEditing(true)}>
          Bearbeiten
        </button>
      )}
    </li>
  )
}

function CareEntryEditor({ entry, onDone }: { entry: CareEntryDto; onDone: () => void }) {
  const queryClient = useQueryClient()
  const { notifyError } = useUndo()
  const today = toDayKey(new Date())
  const [type, setType] = useState(entry.type)
  const [day, setDay] = useState(toDayKey(new Date(entry.performedAt)))
  const [performedBy, setPerformedBy] = useState(entry.performedBy ?? '')
  const [comment, setComment] = useState(entry.comment ?? '')

  const refresh = async () => {
    await queryClient.invalidateQueries()
    onDone()
  }

  const { mutate, isPending } = useUpdateCareEntry({
    mutation: { onSuccess: refresh, onError: (error) => notifyError(errorMessage(error)) },
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const dayChanged = day !== toDayKey(new Date(entry.performedAt))
    mutate({
      entryId: entry.id,
      data: {
        type,
        performedAt: dayChanged ? (performedAtForDay(day) ?? new Date().toISOString()) : undefined,
        performedBy,
        comment,
      },
    })
  }

  const onDelete = async () => {
    if (!window.confirm(`Eintrag „${CARE_TYPE_LABEL[entry.type]}“ vom ${formatDate(entry.performedAt)} löschen?`)) {
      return
    }
    try {
      await deleteCareEntry(entry.id)
      await refresh()
    } catch (error) {
      notifyError(errorMessage(error))
    }
  }

  return (
    <form className="care-form care-form-compact" onSubmit={onSubmit}>
      <div className="field-row">
        <label className="field">
          <span>Art</span>
          <select value={type} onChange={(event) => setType(event.target.value as CareType)}>
            {CARE_TYPES.map((careType) => (
              <option key={careType} value={careType}>
                {CARE_TYPE_LABEL[careType]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Datum</span>
          <input type="date" value={day} max={today} onChange={(event) => setDay(event.target.value || day)} />
        </label>
      </div>
      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={performedBy}
          maxLength={100}
          onChange={(event) => setPerformedBy(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Kommentar</span>
        <textarea rows={2} value={comment} maxLength={1000} onChange={(event) => setComment(event.target.value)} />
      </label>
      <div className="button-row">
        <button className="button button-primary" type="submit" disabled={isPending}>
          Speichern
        </button>
        <button className="button" type="button" onClick={onDone}>
          Abbrechen
        </button>
        <button className="button button-danger" type="button" onClick={onDelete}>
          Löschen
        </button>
      </div>
    </form>
  )
}
