import { ApiProperty } from '@nestjs/swagger'

import { DeviceDetailsResponseDto } from '../../device/dto/device-details-response.dto'

import { GroupResponseDto } from './group-response.dto'

export class GroupWithDevicesResponseDto extends GroupResponseDto {
  @ApiProperty({ type: [DeviceDetailsResponseDto] })
  devices: DeviceDetailsResponseDto[]
}
