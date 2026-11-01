import { useEffect, useState } from 'react'

/** 5 decimals ≈ 1 m, more precision is meaningless for a search center */
export const COORDINATE_DECIMALS = 5
const COORDINATE_PATTERN = new RegExp(`^-?\\d*(\\.\\d{0,${COORDINATE_DECIMALS}})?$`)

export function formatCoordinate(value: number | null): string {
  return value == null ? '' : String(Number(value.toFixed(COORDINATE_DECIMALS)))
}

/**
 * Text input for a latitude/longitude limited to `COORDINATE_DECIMALS` decimals.
 * Keeps the typed text locally so partial input like "48." is not lost, and shows
 * external changes (map click, GPS, place search) rounded.
 */
export function CoordinateInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  onBlur: () => void
  placeholder: string
}) {
  const [text, setText] = useState(formatCoordinate(value))

  // Sync external changes, but leave the text alone while it already represents the value
  useEffect(() => {
    const typed = text === '' || text === '-' ? null : parseFloat(text)
    const rounded = value == null ? null : Number(value.toFixed(COORDINATE_DECIMALS))
    if (typed !== rounded) setText(formatCoordinate(value))
    // Only react to external value changes, not to typing (text is intentionally not a dependency)
  }, [value])

  return (
    <label style={styles.coordinateField}>
      <span style={styles.label}>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const next = e.target.value.replace(',', '.')
          if (!COORDINATE_PATTERN.test(next)) return
          setText(next)
          const parsed = parseFloat(next)
          onChange(isNaN(parsed) ? null : parsed)
        }}
        onBlur={onBlur}
        style={styles.input}
        placeholder={placeholder}
      />
    </label>
  )
}

const styles = {
  coordinateField: {
    flex: 1,
    minWidth: 0,
  } as const,
  label: {
    display: 'block',
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500,
    color: '#555',
  } as const,
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 4,
    marginBottom: 8,
    boxSizing: 'border-box',
  } as const,
}
