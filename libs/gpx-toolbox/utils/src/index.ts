export * from './lib/render-svg'

// Parsing & serialization
export { parseGpx } from './lib/gpx-parser'
export { serializeGpx } from './lib/gpx-serializer'
export { segmentTrack } from './lib/segmenter'
export { analyzeGpx, analyzePoints } from './lib/track-stats'

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
export { computeModifiedHausdorffDistance, resampleTrack } from './lib/track-similarity'
export type { GeoPoint, TrackSimilarityOptions } from './lib/track-similarity'
export { computeBoundingBox, expandBoundingBox } from './lib/bounding-box'
export type { BoundingBox } from './lib/bounding-box'
export { decodePolyline } from './lib/encoded-polyline'
export * from './lib/track-stats'
