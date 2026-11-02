type SweepThresholdFieldsProps = {
  green: string
  yellow: string
  onGreenChange: (value: string) => void
  onYellowChange: (value: string) => void
  disabled?: boolean
}

/** Traffic light thresholds, kept as text so the fields can be emptied while typing */
export function SweepThresholdFields({
  green,
  yellow,
  onGreenChange,
  onYellowChange,
  disabled,
}: SweepThresholdFieldsProps) {
  return (
    <div className="field-row field-row-narrow">
      <label className="field">
        <span>Grün bis Tag</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={365}
          value={green}
          onChange={(event) => onGreenChange(event.target.value)}
          disabled={disabled}
          required
        />
      </label>
      <label className="field">
        <span>Gelb bis Tag</span>
        <input
          type="number"
          inputMode="numeric"
          min={green || 0}
          max={365}
          value={yellow}
          onChange={(event) => onYellowChange(event.target.value)}
          disabled={disabled}
          required
        />
      </label>
    </div>
  )
}
