import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access-token') {}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {}
