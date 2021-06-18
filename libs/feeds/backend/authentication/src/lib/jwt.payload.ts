import { User } from '@plusone/feeds/backend/persistence'

export type JwtPayload = {
  username: User['username']
  isAdmin: User['isAdmin']
  roles: string[]
}
