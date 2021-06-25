import { User } from '@plusone/feeds/backend/persistence'

export type JwtPayload = {
  id: User['id']
  username: User['username']
  isAdmin: User['isAdmin']
  roles: string[]
}
