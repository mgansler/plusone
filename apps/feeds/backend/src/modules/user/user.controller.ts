import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'

import { UserResponseDto } from '../authentication/authentication.dto'
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
  @ApiOkResponse({ description: 'List of all users.', type: [UserResponseDto] })
  getAll(): Promise<UserResponseDto[]> {
    return this.userService.getAll()
  }
}
