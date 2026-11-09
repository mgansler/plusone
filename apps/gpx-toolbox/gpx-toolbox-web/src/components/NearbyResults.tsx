import { useTranslation } from 'react-i18next'

import type { NearbyRouteResponseDto } from '@plusone/gpx-toolbox-api-client'

import type { RouteSelection } from '../hooks/useRouteSelection'
import { routeColor } from '../utils/routeColors'

import { ElevationProfile } from './ElevationProfile'
import { RouteResultCard } from './RouteResultCard'

type NearbyResultsProps = {
  results: Array<NearbyRouteResponseDto>
  selection: RouteSelection
}

/** Cards of the found routes; the selected one shows its elevation profile. Takes the width it is given. */
export function NearbyResults({ results, selection }: NearbyResultsProps) {
  return (
    <>
      {results.map((route, index) => (
        <RouteResultCard
          key={route.id}
          route={route}
          color={routeColor(index)}
          selected={selection.selectedRoute === route.id}
          hovered={selection.hoveredRoute === route.id}
          onSelect={() => selection.selectFromList(route)}
          onHoverChange={(hovered) => selection.setHovered(route.id, hovered)}
        >
          <SelectedRouteProfile selection={selection} />
        </RouteResultCard>
      ))}
    </>
  )
}

function SelectedRouteProfile({ selection }: { selection: RouteSelection }) {
  const { t } = useTranslation()
  if (selection.gpxLoading) return <div style={styles.hint}>{t('nearby.profileLoading')}</div>
  if (!selection.hasElevation) return <div style={styles.hint}>{t('nearby.noProfile')}</div>
  return (
    <ElevationProfile
      points={selection.points}
      range={[0, selection.distanceKm]}
      onPointHover={selection.setProfilePoint}
    />
  )
}

const styles = {
  hint: {
    fontSize: 12,
    color: '#888',
  } as const,
}
