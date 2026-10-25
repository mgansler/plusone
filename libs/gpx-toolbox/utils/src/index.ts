export * from './lib/render-svg'

// Parsing & segmentation
export { parseGpx } from './lib/gpx-parser'
export { segmentTrack } from './lib/segmenter'
export { analyzeGpx } from './lib/track-stats'

// Types
export type {
  TrackPoint,
  SmootherOptions,
  SegmentType,
  RawSegment,
  ProcessedSegment,
  SegmentOverview,
  TrackOverview,
} from './lib/types'

// Utilities
export { calculateHaversineDistance, calculateBearing } from './lib/haversine-distance'
export * from './lib/track-stats'
