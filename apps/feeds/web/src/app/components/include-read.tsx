import { useFeedSettingsContext } from '../context/feed-settings'

export function IncludeRead() {
  const { includeRead, setIncludeRead } = useFeedSettingsContext()

  return (
    <label>
      Include read
      <input type={'checkbox'} checked={includeRead} onChange={() => setIncludeRead((cur) => !cur)} />
    </label>
  )
}
