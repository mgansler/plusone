import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

import type { User } from '../utils/session.server'
import { requireUser } from '../utils/session.server'

type LoaderData = {
  user: User
}

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData | Response> => {
  const user = await requireUser(request)
  if (!user.isAdmin) throw new Response('Unauthorized', { status: 403 })

  const url = new URL(request.url)
  if (url.pathname === '/admin') return redirect('admin/dashboard')

  return { user }
}

export default function Admin() {
  const data = useLoaderData<LoaderData>()

  return (
    <div>
      <h1>Admin View</h1>

      <form method={'post'} action={'/logout'}>
        <button type={'submit'}>Logout {data.user.username}</button>
      </form>

      <Link to={'dashboard'}>Dashboard</Link>
      <Link to={'settings'}>Settings</Link>

      <Outlet />
    </div>
  )
}
