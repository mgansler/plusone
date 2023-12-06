import { Injectable, Logger } from '@nestjs/common'

import { Group, PrismaService } from '@plusone/elgato-persistence'

import { DeviceService } from '../device/device.service'
import { DeviceDetailsResponseDto } from '../device/dto/device-details-response.dto'
import { DevicePowerState } from '../device/enum/device-power-state'

import { GroupCreateDto } from './dto/group-create.dto'
import { GroupResponseDto } from './dto/group-response.dto'
import { GroupWithDevicesResponseDto } from './dto/group-with-devices-response.dto'

@Injectable()
export class GroupService {
  private logger = new Logger(GroupService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly deviceService: DeviceService,
  ) {}

  async getAllGroups() {
    return this.prismaService.group.findMany({ include: { devices: true } })
  }

  async getGroup(groupId: Group['id']): Promise<GroupWithDevicesResponseDto> {
    const { id, name, isRoom, devices } = await this.prismaService.group.findUniqueOrThrow({
      include: { devices: true },
      where: { id: groupId },
    })

    const devicesWithState: DeviceDetailsResponseDto[] = []
    for (const device of devices) {
      devicesWithState.push(await this.deviceService.getDevice(device.id))
    }

    return {
      id,
      name,
      isRoom,
      devices: devicesWithState,
    }
  }

  async createGroup(groupCreateDto: GroupCreateDto): Promise<GroupResponseDto> {
    return this.prismaService.group.create({
      data: groupCreateDto,
    })
  }

  async setGroupState(id: Group['id'], targetState: DevicePowerState) {
    await this.prismaService.group.findUniqueOrThrow({ where: { id } })
    return this.deviceService.setGroupState(id, targetState)
  }
}
