import type { ActionFunction } from 'remix'
import { redirect } from 'remix'

import { baseUrl } from '~/entry.server'
import { getUserSession } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request)

  await fetch(`${baseUrl}/scheduling/now`, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${session.get('token')}`,
    },
  })

  console.log(new URL(request.url).pathname)

  return redirect('/admin/dashboard')
}
