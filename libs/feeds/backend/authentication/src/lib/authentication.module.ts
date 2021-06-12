import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DatabaseModule, User } from '@plusone/feeds/backend/database'

import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'
import { jwtConstants } from './authentication.constants'

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
