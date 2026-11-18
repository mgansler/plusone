import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BRouterService } from './brouter.service'
import { BRouterRequestDto, BRouterResponseDto, BRouterRoutesResponseDto } from './dto/brouter.dto'
import { JwtPayload } from './jwt.strategy'
import { JwtAuthGuard } from './jwt-auth.guard'

@ApiTags('brouter')
@UseGuards(JwtAuthGuard)
@Controller('brouter')
export class BRouterController {
  private readonly logger = new Logger(BRouterController.name)

  constructor(private readonly brouterService: BRouterService) {}

  @Post('route')
  @ApiOperation({ summary: 'Calculate a route using BRouter', operationId: 'getRoute' })
  @ApiBearerAuth()
  @ApiBody({ type: BRouterRequestDto })
  @ApiResponse({ status: 201, description: 'Route calculated successfully', type: BRouterResponseDto })
  async getRoute(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: BRouterRequestDto,
  ): Promise<BRouterResponseDto> {
    this.logger.debug(
      `Calculating route for user ${req.user.sub} with ${dto.points.length} points: [${dto.points.join('],[')}]`,
    )
    return this.brouterService.getRoute('https://bikerouter.de', dto.points, dto.profile)
  }

  @Post('routes')
  @ApiOperation({ summary: 'Calculate 3 route alternatives using BRouter', operationId: 'getRoutes' })
  @ApiBearerAuth()
  @ApiBody({ type: BRouterRequestDto })
  @ApiResponse({ status: 201, description: 'Routes calculated successfully', type: BRouterRoutesResponseDto })
  async getRoutes(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: BRouterRequestDto,
  ): Promise<BRouterRoutesResponseDto> {
    this.logger.debug(`Calculating 3 route alternatives for user ${req.user.sub} with ${dto.points.length} points`)
    return this.brouterService.getRoutes('https://bikerouter.de', dto.points, dto.profile)
  }
}
