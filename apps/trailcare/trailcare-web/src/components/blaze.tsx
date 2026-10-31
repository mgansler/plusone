import { SweepStatus } from '@plusone/trailcare-api-client'

const STATUS_LABEL: Record<SweepStatus, string> = {
  [SweepStatus.GREEN]: 'frisch gefegt',
  [SweepStatus.YELLOW]: 'bald wieder fegen',
  [SweepStatus.RED]: 'fegen nötig',
}

type BlazeProps = {
  status: SweepStatus | `${SweepStatus}`
  /** Shown inside the marker, usually the days since the last sweep */
  value?: string | number
  size?: 'regular' | 'large'
}

/** Painted trail marker, the traffic light of a trail */
export function Blaze({ status, value, size = 'regular' }: BlazeProps) {
  return (
    <span className={`blaze blaze-${size}`} data-status={status} role="img" aria-label={STATUS_LABEL[status]}>
      <svg viewBox="0 0 40 52" aria-hidden="true" preserveAspectRatio="none">
        <path d="M3.5 4.2 C11 2.6 27 3.4 36.8 2.9 C37.6 14 36.4 32 37.4 48.6 C27 49.8 12 48.4 2.8 49.4 C2 36 3.6 17 3.5 4.2 Z" />
      </svg>
      {value !== undefined && <span className="blaze-value">{value}</span>}
    </span>
  )
}
