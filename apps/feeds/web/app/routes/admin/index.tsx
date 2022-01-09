import type { LoaderFunction } from 'remix'
import { useLoaderData } from 'remix'

import type { User } from '~/utils/session.server'
import { requireUser } from '~/utils/session.server'

type LoaderData = {
  user: User
}

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const user = await requireUser(request)
  return { user }
}

export default function Admin() {
  const data = useLoaderData<LoaderData>()

  return (
    <div>
      <h1>Admin View</h1>
      <form method={'post'} action={'/admin/fetch-now'}>
        <button type={'submit'}>Fetch now!</button>
      </form>

      <form method={'post'} action={'/logout'}>
        <button type={'submit'}>Logout {data.user.username}</button>
      </form>
    </div>
  )
}
