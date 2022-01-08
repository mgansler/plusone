import type { LoaderFunction } from 'remix'

// eslint-disable-next-line import/no-unresolved
import { baseUrl } from '~/config'

export const loader: LoaderFunction = async () => {
  const resp = await fetch(`${baseUrl}/health`)
  return await resp.json()
}
