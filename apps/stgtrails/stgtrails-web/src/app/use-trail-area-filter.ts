import { useMatchRoute } from '@tanstack/react-router'

import { COUNTRY_PATH, STATE_PATH, TRAIL_AREA_PATH } from '../routes/__root'

export const AnyCountryOrState = 'any'

type TrailAreaFilter = {
  country: typeof AnyCountryOrState | string
  state: typeof AnyCountryOrState | string
  trailArea: string | undefined
}

export function useTrailAreaFilter(): TrailAreaFilter {
  const matchRoute = useMatchRoute()

  if (matchRoute({ to: TRAIL_AREA_PATH })) {
    return matchRoute({ to: TRAIL_AREA_PATH })
  }

  if (matchRoute({ to: STATE_PATH })) {
    return {
      country: matchRoute({ to: STATE_PATH }).country,
      state: matchRoute({ to: STATE_PATH }).state,
      trailArea: undefined,
    }
  }

  if (matchRoute({ to: COUNTRY_PATH })) {
    return {
      country: matchRoute({ to: COUNTRY_PATH }).country,
      state: AnyCountryOrState,
      trailArea: undefined,
    }
  }

  return { country: AnyCountryOrState, state: AnyCountryOrState, trailArea: undefined }
}
