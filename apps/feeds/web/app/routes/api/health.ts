import type { LoaderFunction } from 'remix'

import { baseUrl } from '~/entry.server'

export const loader: LoaderFunction = async () => {
  const resp = await fetch(`${baseUrl}/health`)
  return await resp.json()
}
