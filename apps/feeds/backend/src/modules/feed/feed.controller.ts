import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
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
import { TagResponseDto } from '../tag/tag.dto'
import { TagService } from '../tag/tag.service'

import {
  DiscoverResponseDto,
  FeedDiscoverDto,
  FeedInputDto,
  FeedResponseDto,
  FeedSettingsResponseDto,
  TagFeedInputDto,
  UpdateFeedSettingsInputDto,
  UserFeedResponseDto,
} from './feed.dto'
import { FeedService } from './feed.service'

@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly tagService: TagService) {}

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

  @ApiOperation({ operationId: 'import-feeds' })
  @ApiBody({ description: 'Required information to create a feed.', type: [FeedInputDto] })
  @Post('import')
  async import(@Body() feedInputs: FeedInputDto[], @Req() { user }) {
    await this.feedService.import(feedInputs, user.id)
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

  @ApiOperation({ operationId: 'get-feed-settings' })
  @ApiParam({ name: 'id', description: 'The id of the feed.', type: String })
  @ApiOkResponse({ description: 'Settings for feed', type: FeedSettingsResponseDto })
  @Get(':id/settings')
  async getFeedSettings(@Param('id') id: string, @Req() { user }): Promise<FeedSettingsResponseDto> {
    return this.feedService.getFeedSettings(user, id)
  }

  @ApiOperation({ operationId: 'update-feed-settings' })
  @ApiParam({ name: 'id', description: 'The id of the feed.', type: String })
  @Put(':id/settings')
  async updateFeedSettings(
    @Param('id') id: string,
    @Body() updateFeedSettingsInput: UpdateFeedSettingsInputDto,
    @Req() { user },
  ) {
    await this.feedService.updateFeedSettings(user, id, updateFeedSettingsInput)
  }

  @ApiOperation({ operationId: 'get-feed-tags' })
  @ApiParam({ name: 'id', description: 'The id of the feed.', type: String })
  @ApiOkResponse({ description: 'Settings for feed', type: [TagResponseDto] })
  @Get(':id/tags')
  async getFeedTags(@Param('id') id: string, @Req() { user }) {
    return await this.tagService.getFeedTags(id, user.id)
  }

  @ApiOperation({ operationId: 'tag-feed' })
  @ApiParam({ name: 'id', description: 'The id of the feed.', type: String })
  @ApiBody({ description: 'Description of the tag to add to a feed.', type: TagFeedInputDto })
  @Post(':id/tags')
  async tagFeed(@Param('id') id: string, @Body() tagFeedInput: TagFeedInputDto, @Req() { user }) {
    return await this.tagService.attachToFeed(id, tagFeedInput.tagId, user.id)
  }

  @ApiOperation({ operationId: 'untag-feed' })
  @ApiParam({ name: 'id', description: 'The id of the feed.', type: String })
  @ApiBody({ description: 'Description of the tag to remove a feed.', type: TagFeedInputDto })
  @Delete(':id/tags')
  async untagFeed(@Param('id') id: string, @Body() tagFeedInput: TagFeedInputDto, @Req() { user }) {
    return await this.tagService.detachFromFeed(id, tagFeedInput.tagId, user.id)
  }
}
