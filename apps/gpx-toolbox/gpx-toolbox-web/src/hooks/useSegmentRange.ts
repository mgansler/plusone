import { useEffect, useMemo, useState } from 'react'

import { calculateTotalDistance, type TrackPoint } from '@plusone/gpx-toolbox-utils'

/**
 * Holds the selected segment (in km) for a track. Resets to the full track whenever `points` changes.
 */
export function useSegmentRange(points: Array<TrackPoint>) {
  const totalDistKm = useMemo(() => calculateTotalDistance(points) / 1000, [points])
  const [segmentRange, setSegmentRange] = useState<[number, number]>([0, totalDistKm])

  useEffect(() => {
    // Keep the previous state if nothing changed, so callers passing a fresh array each render don't loop
    setSegmentRange((prev) => (prev[0] === 0 && prev[1] === totalDistKm ? prev : [0, totalDistKm]))
  }, [points, totalDistKm])

  return { totalDistKm, segmentRange, setSegmentRange }
}
