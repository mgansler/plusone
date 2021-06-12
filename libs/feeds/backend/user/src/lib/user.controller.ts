import { Controller, Get, UseGuards } from '@nestjs/common'

import { JwtAuthGuard, Roles, RolesGuard } from '@plusone/feeds/backend/authentication'

import { UserService } from './user.service'

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @Roles('admin')
  getAll() {
    return this.userService.getAll()
  }
}
