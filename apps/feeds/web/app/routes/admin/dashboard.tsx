import type { LoaderFunction } from 'remix'
import { useLoaderData } from 'remix'

import { baseUrl } from '~/entry.server'

type LoaderData = {
  health: {
    status: 'error' | 'ok' | 'shutting_down'
  }
}

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const health = await (await fetch(`${baseUrl}/health`)).json()
  return { health }
}
export default function () {
  const data = useLoaderData<LoaderData>()

  return (
    <>
      <p>Status: {data.health.status}</p>

      <form method={'post'} action={'/admin/dashboard/fetch-now'}>
        <button type={'submit'}>Fetch now!</button>
      </form>
    </>
  )
}
