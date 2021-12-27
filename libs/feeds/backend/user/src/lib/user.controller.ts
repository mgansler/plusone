import { Controller, Get, UseGuards } from '@nestjs/common'

import { JwtAuthGuard, Roles, RolesGuard } from '@plusone/feeds/backend/authentication'
import { UserResponse } from '@plusone/feeds/shared/types'

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
