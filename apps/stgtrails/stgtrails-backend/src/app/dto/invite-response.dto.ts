import { IsUrl } from 'class-validator'

export class InviteResponseDto {
  @IsUrl()
  inviteUrl: string
}
