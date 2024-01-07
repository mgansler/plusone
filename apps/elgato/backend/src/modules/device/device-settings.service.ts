import { Injectable, Logger } from '@nestjs/common'

import { Device, PrismaService } from '@plusone/elgato-persistence'

import { DeviceSettingsRequestDto } from './dto/device-settings-request.dto'

@Injectable()
export class DeviceSettingsService {
  private logger = new Logger(DeviceSettingsService.name)

  constructor(private readonly prismaService: PrismaService) {}

  async getCurrentSettings(macAddress: Device['macAddress']) {
    return this.prismaService.device.findUniqueOrThrow({
      select: { sunrise: true, sunset: true },
      where: { macAddress },
    })
  }

  async updateSettings(macAddress: Device['macAddress'], newSettings: DeviceSettingsRequestDto) {
    return this.prismaService.device.update({
      select: { sunrise: true, sunset: true },
      where: { macAddress },
      data: newSettings,
    })
  }
}
