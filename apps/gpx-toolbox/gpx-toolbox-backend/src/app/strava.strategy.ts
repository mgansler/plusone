import { Injectable } from '@nestjs/common'

@Injectable()
export class StravaStrategy {
  /**
   * Validate Strava user profile after OAuth callback.
   * This is called by the auth controller after receiving the Strava profile.
   */
  async validateProfile(profile: any): Promise<any> {
    return {
      stravaId: profile.id,
      name: profile.firstname ?? profile.lastname ?? profile.name ?? null,
      avatarUrl: profile.profile,
    }
  }
}
