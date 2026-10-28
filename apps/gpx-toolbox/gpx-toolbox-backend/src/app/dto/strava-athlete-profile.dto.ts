import { ApiProperty } from '@nestjs/swagger'

export class StravaAthleteProfileDto {
  @ApiProperty({ example: 123456 })
  id: number

  @ApiProperty({ example: 'John' })
  firstname: string

  @ApiProperty({ example: 'Doe' })
  lastname: string

  @ApiProperty({ required: false, example: 'johndoe', description: 'Strava username, not set for every account' })
  username?: string

  @ApiProperty({ required: false })
  profile?: Record<string, unknown>

  @ApiProperty({ required: false })
  profile_medium?: Record<string, unknown>

  @ApiProperty({ required: false })
  city?: string

  @ApiProperty({ required: false })
  state?: string

  @ApiProperty({ required: false })
  country?: string

  @ApiProperty({ example: 'M' })
  gender: string

  @ApiProperty({ required: false })
  weight?: Record<string, unknown>

  @ApiProperty({ required: false })
  friend?: Record<string, unknown>

  @ApiProperty({ required: false })
  follower?: Record<string, unknown>

  @ApiProperty({ example: 'cyclist' })
  athleteType: string

  @ApiProperty({ required: false })
  premium?: boolean

  @ApiProperty({ required: false })
  summit?: boolean

  @ApiProperty({ required: false })
  created_at?: string

  @ApiProperty({ required: false })
  updated_at?: string

  @ApiProperty({ required: false })
  follower_count?: number

  @ApiProperty({ required: false })
  friend_count?: number

  @ApiProperty({ required: false })
  measurement_preference?: string

  @ApiProperty({ required: false })
  ftp?: Record<string, unknown>

  @ApiProperty({ required: false })
  clubs?: Record<string, unknown>

  @ApiProperty({ required: false })
  bikes?: Record<string, unknown>

  @ApiProperty({ required: false })
  shoes?: Record<string, unknown>

  @ApiProperty({ required: false })
  localStats?: Record<string, unknown>
}
