import { useArticleFindContext } from '../context/article-find'

export function IncludeRead() {
  const { includeRead, setIncludeRead } = useArticleFindContext()

  return (
    <label>
      Include read
      <input type={'checkbox'} checked={includeRead} onChange={() => setIncludeRead(!includeRead)} />
    </label>
  )
}
