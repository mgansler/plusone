import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { UserResponseDto } from '../authentication/authentication.dto'
import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Roles } from '../authentication/roles.decorator'
import { RolesGuard } from '../authentication/roles.guard'

import { UserService } from './user.service'

@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles('admin')
  @ApiOperation({ operationId: 'get-users' })
  @ApiOkResponse({ description: 'List of all users.', type: [UserResponseDto] })
  @Get('')
  getAll(): Promise<UserResponseDto[]> {
    return this.userService.getAll()
  }
}
