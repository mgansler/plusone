import { ChevronIcon } from './icons'

type AreaToggleProps = {
  name: string
  expanded: boolean
  controls: string
  onToggle: () => void
  /** Shown next to the name while collapsed */
  summary?: string
  /** Searching keeps every area open, the toggle is disabled then */
  disabled?: boolean
  level?: 2 | 3
}

/** Heading of a trail area that folds its trails in and out */
export function AreaToggle({ name, expanded, controls, onToggle, summary, disabled, level = 2 }: AreaToggleProps) {
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <Heading className="area-name">
      <button
        type="button"
        className="area-toggle"
        aria-expanded={expanded}
        aria-controls={expanded ? controls : undefined}
        onClick={onToggle}
        disabled={disabled}
      >
        <ChevronIcon className="area-chevron" />
        <span>{name}</span>
        {!expanded && summary && <span className="area-summary">{summary}</span>}
      </button>
    </Heading>
  )
}
