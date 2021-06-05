import { User } from '@plusone/feeds/backend/user'

export type JwtPayload = {
  username: User['username']
}
