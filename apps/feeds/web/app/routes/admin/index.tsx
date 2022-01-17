import type { LoaderFunction } from 'remix'
import { useLoaderData } from 'remix'

import { baseUrl } from '~/entry.server'
import type { User } from '~/utils/session.server'
import { requireUser } from '~/utils/session.server'

type LoaderData = {
  user: User
  health: {
    status: 'error' | 'ok' | 'shutting_down'
  }
}

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const user = await requireUser(request)
  const health = await (await fetch(`${baseUrl}/health`)).json()
  return { user, health }
}

export default function Admin() {
  const data = useLoaderData<LoaderData>()

  return (
    <div>
      <h1>Admin View</h1>

      <p>Status: {data.health.status}</p>

      <form method={'post'} action={'/admin/fetch-now'}>
        <button type={'submit'}>Fetch now!</button>
      </form>

      <form method={'post'} action={'/logout'}>
        <button type={'submit'}>Logout {data.user.username}</button>
      </form>
    </div>
  )
}
