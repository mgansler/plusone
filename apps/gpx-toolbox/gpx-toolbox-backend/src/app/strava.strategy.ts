import { Injectable } from '@nestjs/common'

type StravaProfile = { id?: number | string; firstname?: string; lastname?: string; name?: string; profile?: string }

@Injectable()
export class StravaStrategy {
  /**
   * Validate Strava user profile after OAuth callback.
   * This is called by the auth controller after receiving the Strava profile.
   */
  async validateProfile(
    profile: StravaProfile,
  ): Promise<{ stravaId: StravaProfile['id']; name: string | null; avatarUrl?: string }> {
    return {
      stravaId: profile.id,
      name: profile.firstname ?? profile.lastname ?? profile.name ?? null,
      avatarUrl: profile.profile,
    }
  }
}
