import { ApiProperty } from '@nestjs/swagger'

import { LightStateWithColor } from './elgato-device-state.dto'

export class ElgatoDeviceStatePayloadDto {
  @ApiProperty({ type: () => [LightStateWithColor] })
  lights: Array<LightStateWithColor>
}
