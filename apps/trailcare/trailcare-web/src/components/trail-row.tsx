import { Link } from '@tanstack/react-router'

import type { TrailDto } from '@plusone/trailcare-api-client'

import { CARE_TYPE_LABEL } from '../lib/care-types'
import { relativeDay, sweptLabel } from '../lib/format'
import { useRecordCare } from '../lib/use-record-care'

import { Blaze } from './blaze'
import { BroomIcon, CheckIcon } from './icons'

type TrailRowProps = { trail: TrailDto; matchedAlias?: string }

export function TrailRow({ trail, matchedAlias }: TrailRowProps) {
  const { sweepNow, isPending, isSuccess, reset } = useRecordCare(trail.id, trail.name, () =>
    window.setTimeout(reset, 1_500),
  )
  const last = trail.lastCareEntry
  const showLast = last && last.type !== 'SWEPT'

  return (
    <li className="trail-row" data-status={trail.sweepStatus} data-just-swept={isSuccess || undefined}>
      <Link to="/trails/$trailId" params={{ trailId: String(trail.id) }} className="trail-row-link">
        <Blaze status={trail.sweepStatus} value={trail.daysSinceSwept ?? '–'} />
        <span className="trail-row-text">
          <span className="trail-row-name">{trail.name}</span>
          {matchedAlias && <span className="trail-row-alias">auch „{matchedAlias}“</span>}
          <span className="trail-row-meta">{sweptLabel(trail.daysSinceSwept)}</span>
          {showLast && (
            <span className="trail-row-last" data-type={last.type}>
              {capitalize(relativeDay(last.performedAt))}: {CARE_TYPE_LABEL[last.type]}
            </span>
          )}
        </span>
      </Link>
      <button
        className="sweep-button"
        onClick={sweepNow}
        disabled={isPending}
        aria-label={`${trail.name} jetzt als gefegt eintragen`}
      >
        {isSuccess ? <CheckIcon className="sweep-icon" /> : <BroomIcon className="sweep-icon" />}
      </button>
    </li>
  )
}

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase('de') + text.slice(1)
}
