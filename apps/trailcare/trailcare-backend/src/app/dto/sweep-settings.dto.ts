import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class SweepSettingsDto {
  @ApiProperty({ description: 'Global traffic light: green while days since last sweep <= this value' })
  @IsInt()
  @Min(0)
  @Max(365)
  sweepGreenMaxDays: number

  @ApiProperty({ description: 'Global traffic light: yellow while days since last sweep <= this value' })
  @IsInt()
  @Min(0)
  @Max(365)
  sweepYellowMaxDays: number
}
