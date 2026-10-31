import type { FormEvent } from 'react'
import { useState } from 'react'

import { CareType } from '@plusone/trailcare-api-client'

import { CARE_TYPE_LABEL, CARE_TYPES } from '../lib/care-types'
import { performedAtForDay, toDayKey } from '../lib/format'
import { useRecordCare } from '../lib/use-record-care'

const NAME_KEY = 'trailcare-name'

function readName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function storeName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    // localStorage unavailable, the name is just not remembered
  }
}

export function CareEntryForm({ trailId, trailName }: { trailId: number; trailName: string }) {
  const today = toDayKey(new Date())
  const [type, setType] = useState<CareType>(CareType.SWEPT)
  const [day, setDay] = useState(today)
  const [performedBy, setPerformedBy] = useState(readName)
  const [comment, setComment] = useState('')

  const { record, isPending } = useRecordCare(trailId, trailName, () => {
    setComment('')
    setDay(toDayKey(new Date()))
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    storeName(performedBy.trim())
    record({
      type,
      performedAt: performedAtForDay(day),
      performedBy: performedBy.trim() || undefined,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <form className="care-form" onSubmit={onSubmit}>
      <fieldset className="chips">
        <legend>Was wurde gemacht?</legend>
        {CARE_TYPES.map((careType) => (
          <label key={careType} className="chip" data-type={careType}>
            <input
              type="radio"
              name="care-type"
              value={careType}
              checked={type === careType}
              onChange={() => setType(careType)}
            />
            <span>{CARE_TYPE_LABEL[careType]}</span>
          </label>
        ))}
      </fieldset>

      <div className="field-row">
        <label className="field">
          <span>Wann?</span>
          <input
            type="date"
            value={day}
            max={today}
            onChange={(event) => setDay(event.target.value || today)}
            required
          />
        </label>
        <label className="field">
          <span>Dein Name (optional)</span>
          <input
            type="text"
            autoComplete="given-name"
            value={performedBy}
            maxLength={100}
            onChange={(event) => setPerformedBy(event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Kommentar (optional)</span>
        <textarea
          rows={2}
          value={comment}
          maxLength={1000}
          placeholder={type === CareType.FALLEN_TREE ? 'Wo liegt der Baum? Kommt man vorbei?' : undefined}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>

      <button className="button button-primary" type="submit" disabled={isPending}>
        Eintragen
      </button>
    </form>
  )
}
