import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { ElgatoService } from './elgato.service'

@Module({
  imports: [HttpModule],
  providers: [ElgatoService],
  exports: [ElgatoService],
})
export class ElgatoModule {}
