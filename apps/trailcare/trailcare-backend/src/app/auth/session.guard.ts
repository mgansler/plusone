import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { Role } from '@plusone/trailcare-persistence'

import { IS_ADMIN_ONLY, IS_PUBLIC, RequestWithSession } from './auth.decorators'
import { readSessionToken } from './session-cookie'
import { SessionService } from './session.service'

/** Global guard: every endpoint requires a session unless marked with @Public() */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()]
    const request = context.switchToHttp().getRequest<Request & RequestWithSession>()

    const token = readSessionToken(request)
    const session = token ? await this.sessionService.findSession(token) : null
    if (session) {
      request.trailcareSession = session
    }

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) {
      return true
    }

    if (!session) {
      throw new UnauthorizedException()
    }

    if (this.reflector.getAllAndOverride<boolean>(IS_ADMIN_ONLY, targets) && session.role !== Role.ADMIN) {
      throw new ForbiddenException()
    }

    return true
  }
}
