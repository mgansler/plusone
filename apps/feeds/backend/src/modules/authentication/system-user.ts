import { TokenPayload } from './jwt.strategy'

export const SystemUser: TokenPayload = {
  id: 'system',
  username: 'SYSTEM',
  isAdmin: true,
  roles: ['admin'],
}
