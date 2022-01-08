import { Controller, Get, UseGuards } from '@nestjs/common'

import { UserResponse } from '@plusone/feeds/shared/types'

import { JwtAuthGuard } from '../authentication/jwt-auth.guard'
import { Roles } from '../authentication/roles.decorator'
import { RolesGuard } from '../authentication/roles.guard'

import { UserService } from './user.service'

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @Roles('admin')
  getAll(): Promise<UserResponse[]> {
    return this.userService.getAll()
  }
}
