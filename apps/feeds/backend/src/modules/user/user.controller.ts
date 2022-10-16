import { Controller, Get, UseGuards } from '@nestjs/common'

import { UserResponse } from '@plusone/feeds/shared/types'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Roles } from '../authentication/roles.decorator'
import { RolesGuard } from '../authentication/roles.guard'

import { UserService } from './user.service'

@Controller('user')
@UseGuards(JwtAccessTokenGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @Roles('admin')
  getAll(): Promise<UserResponse[]> {
    return this.userService.getAll()
  }
}
