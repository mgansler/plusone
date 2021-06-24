import { JwtPayload } from '@plusone/feeds/backend/authentication'

export const SystemUser: JwtPayload = {
  username: 'SYSTEM',
  isAdmin: true,
  roles: ['admin'],
}
