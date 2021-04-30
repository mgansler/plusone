import { Body, Controller, Post } from '@nestjs/common'

import { AddWebsiteDto } from '../dto/add-website.dto'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  addWebsite(@Body() addWebsiteDto: AddWebsiteDto) {
    return this.appService.addWebsite(addWebsiteDto)
  }
}
