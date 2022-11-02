import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Role, Roles, RolesGuard } from '../authentication/roles.guard'

import {
  DiscoverResponseDto,
  FeedDiscoverDto,
  FeedInputDto,
  FeedResponseDto,
  UpdateFeedSettingsInputDto,
  UserFeedResponseDto,
} from './feed.dto'
import { FeedService } from './feed.service'

@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({ operationId: 'discover-feed' })
  @ApiQuery({ name: 'url', description: 'URL of the website where a feed should be discovered.', type: String })
  @ApiOkResponse({ description: 'Metadata for feed that has been discovered.', type: DiscoverResponseDto })
  @Post('discover')
  discover(@Query() feedDiscoverDto: FeedDiscoverDto): Promise<DiscoverResponseDto> {
    return this.feedService.discover(feedDiscoverDto)
  }

  @ApiOperation({ operationId: 'add-feed' })
  @ApiBody({ description: 'Required information to create a feed.', type: FeedInputDto })
  @ApiCreatedResponse({ description: 'Metadata of the feed that has been created.', type: FeedResponseDto })
  @Post()
  add(@Body() feedInputDto: FeedInputDto, @Req() { user }): Promise<UserFeedResponseDto> {
    return this.feedService.create(feedInputDto, user.id)
  }

  @Roles(Role.Admin)
  @ApiOperation({ operationId: 'get-feeds' })
  @ApiOkResponse({ description: 'Metadata of all feeds.', type: [FeedResponseDto] })
  @Get('all')
  getAll(): Promise<FeedResponseDto[]> {
    return this.feedService.findAll()
  }

  @ApiOperation({ operationId: 'get-user-feeds' })
  @ApiOkResponse({ description: 'Metadata of all feeds.', type: [UserFeedResponseDto] })
  @Get()
  async getAllForUser(@Req() { user }): Promise<UserFeedResponseDto[]> {
    return this.feedService.findAllFor(user)
  }

  @ApiOperation({ operationId: 'update-feed-settings' })
  @ApiParam({ name: 'id', description: 'The id of the feed.', type: String })
  @Put(':id')
  async updateFeedSettings(
    @Param('id') id: string,
    @Body() updateFeedSettingsInput: UpdateFeedSettingsInputDto,
    @Req() { user },
  ) {
    await this.feedService.updateFeedSettings(user, id, updateFeedSettingsInput)
  }
}
