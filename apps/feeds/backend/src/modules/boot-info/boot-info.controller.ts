import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { PAGE_SIZE } from '../../app/consts'

import { BootInfoDto } from './boot-info.dto'

@ApiTags('boot-info')
@Controller('boot-info')
export class BootInfoController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({ operationId: 'boot-info' })
  @ApiOkResponse({ description: 'Configuration for the application', type: BootInfoDto })
  @Get()
  getBootInfo(): BootInfoDto {
    return {
      pageSize: this.configService.get(PAGE_SIZE),
    }
  }
}
