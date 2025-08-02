import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export enum Role {
  User = 'user',
  Admin = 'admin',
}

const ROLES_KEY = 'roles'

export const Roles = (...roles: Array<string>) => SetMetadata(ROLES_KEY, roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Array<string>>(ROLES_KEY, context.getHandler())

    if (!roles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return this.matchRoles(roles, user.roles)
  }

  private matchRoles(requiredRoles: Array<string>, userRoles: Array<string>): boolean {
    return requiredRoles.every((role) => userRoles.includes(role))
  }
}
