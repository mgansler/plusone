import { useState } from 'react'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { useSegmentRange } from '../hooks/useSegmentRange'

import { SegmentMap } from './SegmentMap'
import { Sidebar } from './Sidebar'

export function GPXViewer() {
  const [points, setPoints] = useState<Array<TrackPoint>>([])
  const [fileName, setFileName] = useState<string>()
  const { totalDistKm, segmentRange, setSegmentRange } = useSegmentRange(points)

  function handleLoad(trackPoints: Array<TrackPoint>, name: string) {
    setPoints(trackPoints)
    setFileName(name)
  }

  return (
    <div style={styles.container}>
      <Sidebar
        onFileLoad={handleLoad}
        points={points}
        fileName={fileName}
        segmentRange={segmentRange}
        onSegmentRangeChange={setSegmentRange}
      />
      <SegmentMap points={points} range={segmentRange} totalDistKm={totalDistKm} />
    </div>
  )
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
} as const
