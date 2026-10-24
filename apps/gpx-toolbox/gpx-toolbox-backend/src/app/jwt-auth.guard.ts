import { AuthGuard } from '@nestjs/passport'

/**
 * Guard that validates JWT tokens from the Authorization header.
 * Extracts { sub: userId, stravaId } and attaches to request.user.
 */
export class JwtAuthGuard extends AuthGuard('jwt') {}
