import { INestApplication, ModuleMetadata, ValidationPipe } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { Test } from '@nestjs/testing'

import { Role } from '@plusone/trailcare-persistence'

import { SESSION_COOKIE } from './auth/session-cookie'
import { SessionGuard } from './auth/session.guard'
import { ActiveSession, SessionService } from './auth/session.service'

export const USER_SESSION: ActiveSession = { id: 'user-session', role: Role.USER }
export const ADMIN_SESSION: ActiveSession = { id: 'admin-session', role: Role.ADMIN }

export const AS_USER = `${SESSION_COOKIE}=user-token`
export const AS_ADMIN = `${SESSION_COOKIE}=admin-token`

const SESSIONS: Record<string, ActiveSession> = { 'user-token': USER_SESSION, 'admin-token': ADMIN_SESSION }

/**
 * Controllers with mocked services, but the real session guard and validation pipe.
 * Use the AS_USER / AS_ADMIN cookies to authenticate.
 */
export async function createControllerTestApp(metadata: ModuleMetadata): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    ...metadata,
    providers: [
      ...(metadata.providers ?? []),
      { provide: SessionService, useValue: { findSession: async (token: string) => SESSIONS[token] ?? null } },
      { provide: APP_GUARD, useClass: SessionGuard },
    ],
  }).compile()

  const app = module.createNestApplication()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  return app.init()
}
