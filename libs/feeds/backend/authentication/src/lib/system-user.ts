import type { JwtPayload } from './jwt.payload'

export const SystemUser: JwtPayload = {
  id: 'system',
  username: 'SYSTEM',
  isAdmin: true,
  roles: ['admin'],
}
