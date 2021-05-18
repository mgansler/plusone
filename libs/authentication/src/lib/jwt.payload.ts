import { User } from '@feeds/user'

export type JwtPayload = {
  username: User['username']
}
