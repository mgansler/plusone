import { User } from '@plusone/feeds/backend/database'

export type JwtPayload = {
  username: User['username']
  isAdmin: User['isAdmin']
  roles: string[]
}
