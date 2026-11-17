import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'

import { Role } from '@plusone/trailcare-persistence'

import { ActiveSession } from './session.service'

export const IS_PUBLIC = 'isPublic'
export const IS_ADMIN_ONLY = 'isAdminOnly'
export const IS_CARE_TEAM_OR_ADMIN = 'isCareTeamOrAdmin'

/** Roles that may access care needs */
export const CARE_TEAM_OR_ADMIN_ROLES: Array<Role> = [Role.CARE_TEAM, Role.ADMIN]

export function isCareTeamOrAdmin(role: Role): boolean {
  return CARE_TEAM_OR_ADMIN_ROLES.includes(role)
}

/** Endpoint is reachable without a session */
export const Public = () => SetMetadata(IS_PUBLIC, true)

/** Endpoint requires an admin session */
export const AdminOnly = () => SetMetadata(IS_ADMIN_ONLY, true)

/** Endpoint requires a CARE_TEAM or ADMIN session */
export const CareTeamOrAdmin = () => SetMetadata(IS_CARE_TEAM_OR_ADMIN, true)

export type RequestWithSession = { trailcareSession?: ActiveSession }

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveSession | undefined =>
    context.switchToHttp().getRequest<RequestWithSession>().trailcareSession,
)
