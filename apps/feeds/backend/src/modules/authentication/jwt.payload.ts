import { User } from '@plusone/feeds-persistence'

export type JwtPayload = {
  id: User['id']
  username: User['username']
  isAdmin: User['isAdmin']
  roles: string[]
}
