import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

import { User } from '@plusone/github-schema'

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

  @Roles('admin')
  @ApiOperation({ operationId: 'delete-user' })
  @ApiParam({ name: 'userId', description: 'The id of the user to be deleted' })
  @ApiNoContentResponse({ description: 'User has been deleted' })
  @Delete(':userId')
  remove(@Param('userId') userId: User['id']) {
    return this.userService.deleteUser(userId)
  }
}
