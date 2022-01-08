import type { LoaderFunction } from 'remix'
import { useLoaderData } from 'remix'

// eslint-disable-next-line import/no-unresolved
import { baseUrl } from '~/config'
// eslint-disable-next-line import/no-unresolved
import Health from '~/shared/health'

export const loader: LoaderFunction = async () => {
  const resp = await fetch(`${baseUrl}/health`)
  return resp.json()
}

export default function Index() {
  const result = useLoaderData()

  return (
    <main>
      <h2>Welcome to feeds-web</h2>
      <p>Status (loader): {result.status}</p>
      <Health />
    </main>
  )
}
