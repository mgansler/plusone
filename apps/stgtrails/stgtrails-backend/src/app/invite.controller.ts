import { Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { InviteResponseDto } from './dto/invite-response.dto'
import { InviteService } from './invite.service'

@Controller('invite')
@ApiTags('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @ApiOperation({ operationId: 'createInvite' })
  @ApiBasicAuth()
  @Post('createInvite')
  createInvite(): Promise<InviteResponseDto> {
    return this.inviteService.createNewInvite('change_me')
  }

  @Get('accept/:inviteId')
  public async acceptInvite(@Param('inviteId') inviteId: string): Promise<void> {
    this.inviteService.acceptInvite(inviteId)
  }
}
