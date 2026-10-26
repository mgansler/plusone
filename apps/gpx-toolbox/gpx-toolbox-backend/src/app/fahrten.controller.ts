import { Body, Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { FahrtenService } from './fahrten.service'
import { FahrtResponseDto, QueryFahrtDto, UpdateFahrtDto } from './dto/ride.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'

@ApiTags('fahrten')
@ApiBearerAuth()
@Controller('fahrten')
@UseGuards(JwtAuthGuard)
export class FahrtenController {
  private readonly logger = new Logger(FahrtenController.name)

  constructor(private readonly fahrtenService: FahrtenService) {}

  @Get()
  @ApiOperation({ operationId: 'listAllFahrten' })
  @ApiOkResponse({ description: 'List of fahrten', type: [FahrtResponseDto] })
  async findAll(@Req() req: Request & { user: JwtPayload }, @Query() query: QueryFahrtDto) {
    return this.fahrtenService.findAll(query, req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getFahrt' })
  @ApiOkResponse({ description: 'Fahrt details', type: FahrtResponseDto })
  async findOne(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    return this.fahrtenService.findOne(id, req.user.sub)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateFahrt' })
  @ApiOkResponse({ description: 'Fahrt updated successfully', type: FahrtResponseDto })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFahrtDto,
  ) {
    return this.fahrtenService.update(id, dto, req.user.sub)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteFahrt' })
  @ApiOkResponse({ description: 'Fahrt deleted successfully' })
  async remove(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    await this.fahrtenService.remove(id, req.user.sub)
    return { deleted: true, id }
  }
}
