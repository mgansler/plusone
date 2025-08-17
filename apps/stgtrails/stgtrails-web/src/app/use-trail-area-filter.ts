import { useMatchRoute } from '@tanstack/react-router'

import { countryRoute, stateRoute, trailAreaRoute } from '../routes'

export const AnyCountryOrState = 'any'

type TrailAreaFilter = {
  country: typeof AnyCountryOrState | string
  state: typeof AnyCountryOrState | string
  trailArea: string | undefined
}

export function useTrailAreaFilter(): TrailAreaFilter {
  const matchRoute = useMatchRoute()

  if (matchRoute({ to: trailAreaRoute.path })) {
    return matchRoute({ to: trailAreaRoute.path })
  }

  if (matchRoute({ to: stateRoute.path })) {
    return {
      country: matchRoute({ to: stateRoute.path }).country,
      state: matchRoute({ to: stateRoute.path }).state,
      trailArea: undefined,
    }
  }

  if (matchRoute({ to: countryRoute.path })) {
    return {
      country: matchRoute({ to: countryRoute.path }).country,
      state: AnyCountryOrState,
      trailArea: undefined,
    }
  }

  return { country: AnyCountryOrState, state: AnyCountryOrState, trailArea: undefined }
}
