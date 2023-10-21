import { Injectable, Logger } from '@nestjs/common'

import { Device, PrismaService } from '@plusone/elgato-persistence'

import { DeviceSettingsRequestDto } from './dto/device-settings-request.dto'

@Injectable()
export class DeviceSettingsService {
  private logger = new Logger(DeviceSettingsService.name)

  constructor(private readonly prismaService: PrismaService) {}

  async getCurrentSettings(id: Device['id']) {
    return this.prismaService.device.findUniqueOrThrow({
      select: {
        sunrise: true,
        sunset: true,
      },
      where: { id },
    })
  }

  async updateSettings(id: Device['id'], newSettings: DeviceSettingsRequestDto) {
    return this.prismaService.device.update({
      select: { sunrise: true, sunset: true },
      where: { id },
      data: newSettings,
    })
  }
}
