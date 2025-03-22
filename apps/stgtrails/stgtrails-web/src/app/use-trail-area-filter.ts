import { useMatchRoute } from '@tanstack/react-router'

import { countryRoute, stateRoute } from '../routes'

type TrailAreaFilter = {
  country: 'any' | string
  state: 'any' | string
}

export function useTrailAreaFilter(): TrailAreaFilter {
  const matchRoute = useMatchRoute()

  if (matchRoute({ to: stateRoute.path })) {
    return matchRoute({ to: stateRoute.path })
  }

  if (matchRoute({ to: countryRoute.path })) {
    return {
      country: matchRoute({ to: countryRoute.path }).country,
      state: 'any',
    }
  }

  return { country: 'any', state: 'any' }
}
