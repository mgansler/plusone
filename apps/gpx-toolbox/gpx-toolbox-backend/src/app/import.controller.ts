import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { ImportService } from './import.service'
import { ImportActivityUploadDto, ImportResultDto } from './dto/import.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { readUploadedGpx, UploadedGpxFile } from './gpx-upload.util'

@ApiTags('import')
@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('activity')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ operationId: 'importGpxActivity' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportActivityUploadDto })
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importGpxActivity(
    @Req() req: Request & { user: JwtPayload },
    @UploadedFile() file: UploadedGpxFile | undefined,
    @Body('title') title?: string,
  ) {
    const gpxContent = readUploadedGpx(file)

    try {
      return await this.importService.importGpxActivity(gpxContent, req.user.sub, title)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
