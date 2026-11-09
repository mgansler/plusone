import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { useCompareList } from '../hooks/useCompareList'

/** Adds a route to or removes it from the comparison list; usable inside clickable cards and links */
export function CompareToggleButton({ id, name }: { id: string; name: string }) {
  const { t } = useTranslation()
  const { has, add, remove } = useCompareList()
  const selected = has(id)

  function handleClick(event: MouseEvent) {
    // The button sits inside route cards that navigate or select on click
    event.preventDefault()
    event.stopPropagation()
    if (selected) remove(id)
    else add({ id, name })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      style={{ ...styles.button, ...(selected ? styles.selected : {}) }}
    >
      {selected ? t('compare.inCompare') : t('compare.addToCompare')}
    </button>
  )
}

const styles = {
  button: {
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 500,
    border: '1px solid #94a3b8',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#475569',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  } as const,
  selected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
    color: '#fff',
  } as const,
}
