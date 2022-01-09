import type { ActionFunction } from 'remix'

import { logout } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  return await logout(request)
}
