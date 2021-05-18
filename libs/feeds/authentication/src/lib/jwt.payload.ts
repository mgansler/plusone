import { User } from '@plusone/feeds/user'

export type JwtPayload = {
  username: User['username']
}
