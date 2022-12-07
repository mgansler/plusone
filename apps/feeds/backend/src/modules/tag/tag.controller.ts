import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { RolesGuard } from '../authentication/roles.guard'

import { TagInputDto, TagResponseDto } from './tag.dto'
import { TagService } from './tag.service'

@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @ApiOperation({ operationId: 'get-tags' })
  @ApiOkResponse({ description: 'Get all tags for the user', type: [TagResponseDto] })
  @Get()
  async getAll(@Req() { user }): Promise<TagResponseDto[]> {
    return await this.tagService.getAll(user.id)
  }

  @ApiOperation({ operationId: 'add-tag' })
  @ApiBody({ description: 'Request Body to create a new tag', type: TagInputDto })
  @ApiCreatedResponse({ description: 'Metadata of the feed that has been created.', type: TagResponseDto })
  @Post()
  async addTag(@Body() tagInput: TagInputDto, @Req() { user }) {
    return await this.tagService.createTag(tagInput, user.id)
  }

  @ApiOperation({ operationId: 'remove-tag' })
  @ApiParam({ name: 'id', description: 'The id of the tag.', type: String })
  @Delete(':id')
  async deleteTag(@Param('id') id: string, @Req() { user }) {
    return await this.tagService.deleteTag(id, user.id)
  }
}
