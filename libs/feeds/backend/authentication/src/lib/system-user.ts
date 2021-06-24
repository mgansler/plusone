import { JwtPayload } from './jwt.payload'

export const SystemUser: JwtPayload = {
  username: 'SYSTEM',
  isAdmin: true,
  roles: ['admin'],
}
