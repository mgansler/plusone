import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'

import { ActiveSession } from './session.service'

export const IS_PUBLIC = 'isPublic'
export const IS_ADMIN_ONLY = 'isAdminOnly'

/** Endpoint is reachable without a session */
export const Public = () => SetMetadata(IS_PUBLIC, true)

/** Endpoint requires an admin session */
export const AdminOnly = () => SetMetadata(IS_ADMIN_ONLY, true)

export type RequestWithSession = { trailcareSession?: ActiveSession }

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveSession | undefined =>
    context.switchToHttp().getRequest<RequestWithSession>().trailcareSession,
)
