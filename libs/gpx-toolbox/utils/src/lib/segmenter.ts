import { type RawSegment, type SmootherOptions, type TrackPoint } from './types'
import { calculateHaversineDistance } from './haversine-distance'
import { postProcessSegments } from './post-process-segments'

/**
 * Segment a track into uphill / downhill / flat sections.
 *
 * Three-phase pipeline:
 *   1. Distance-based filtering (removes GPS noise)
 *   2. Moving-average smoothing of elevation
 *   3. Hysteresis segmentation (direction changes with deadband)
 */
export function segmentTrack(rawPoints: TrackPoint[], options: SmootherOptions = {}): RawSegment[] {
  const {
    minDistanceMeter = 4, // Filter GPS jitter when standing / moving slowly
    windowSize = 5, // Smoothing window (should be odd)
    thresholdElevation = 2, // Reactivity to elevation changes
  } = options

  if (rawPoints.length < 2) return []

  // ──────────────────────────────────────────────
  // Phase 1: Distance-based filtering
  // ──────────────────────────────────────────────
  const distanceFilteredPoints = [rawPoints[0]]
  let lastValidPoint = rawPoints[0]

  for (let i = 1; i < rawPoints.length; i++) {
    const currentPoint = rawPoints[i]
    const dist = calculateHaversineDistance(lastValidPoint, currentPoint)

    // Keep only points where actual distance was covered
    if (dist >= minDistanceMeter) {
      distanceFilteredPoints.push(currentPoint)
      lastValidPoint = currentPoint
    }
  }

  // If too few points remain after filtering
  if (distanceFilteredPoints.length < windowSize) {
    if (distanceFilteredPoints.length < 2) return []
    // Fallback: short track, segment without smoothing
  }

  // ──────────────────────────────────────────────
  // Phase 2: Mathematical Smoothing (Moving Average)
  // ──────────────────────────────────────────────
  const smoothedPoints = distanceFilteredPoints.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2))
    const end = Math.min(distanceFilteredPoints.length - 1, index + Math.floor(windowSize / 2))

    // Calculate the sum of elevations within the window
    let sum = 0
    for (let i = start; i <= end; i++) {
      sum += distanceFilteredPoints[i].elevation
    }

    return {
      ...point,
      smoothedEle: sum / (end - start + 1),
    }
  })

  // ──────────────────────────────────────────────
  // Phase 3: Hysteresis Segmentation
  // ──────────────────────────────────────────────
  const segments: RawSegment[] = []
  let currentSegment: RawSegment = {
    type: null,
    points: [smoothedPoints[0]],
    totalDistance: 0,
    elevationGain: 0,
    startDistanceSinceStart: 0,
  }

  // These two variables track the extreme points within the current segment
  let highestEleInSegment = smoothedPoints[0].smoothedEle
  let lowestEleInSegment = smoothedPoints[0].smoothedEle

  for (let i = 1; i < smoothedPoints.length; i++) {
    const prevPoint = currentSegment.points[currentSegment.points.length - 1]
    const currPoint = smoothedPoints[i]
    const currentEle = currPoint.smoothedEle

    const segmentStepDist = calculateHaversineDistance(prevPoint, currPoint)

    // Update the extreme points within the current segment
    if (currentEle > highestEleInSegment) highestEleInSegment = currentEle
    if (currentEle < lowestEleInSegment) lowestEleInSegment = currentEle

    // Determine the direction type based on the deviation from the extreme point
    let detectedType = currentSegment.type

    if (currentSegment.type === 'uphill') {
      // If we are uphill, a drop from the HIGHEST point triggers the change
      if (highestEleInSegment - currentEle >= thresholdElevation) {
        detectedType = 'downhill'
      }
    } else if (currentSegment.type === 'downhill') {
      // If we are downhill, a rise from the LOWEST point triggers the change
      if (currentEle - lowestEleInSegment >= thresholdElevation) {
        detectedType = 'uphill'
      }
    } else {
      // For the start ('flat' / null): Compare with the direct starting point
      const startPointOfSegment = currentSegment.points[0]
      const eleDiffFromStart = currentEle - startPointOfSegment.smoothedEle
      if (Math.abs(eleDiffFromStart) >= thresholdElevation) {
        detectedType = eleDiffFromStart > 0 ? 'uphill' : 'downhill'
      }
    }

    // Segment logic
    if (currentSegment.type === null || currentSegment.type === 'flat') {
      currentSegment.type = detectedType || 'flat'
      currentSegment.points.push(currPoint)
      currentSegment.totalDistance += segmentStepDist
    } else if (detectedType !== currentSegment.type) {
      // REAL DIRECTION CHANGE DETECTED!
      segments.push(currentSegment)

      // Seamlessly start a new segment
      currentSegment = {
        type: detectedType,
        points: [smoothedPoints[i - 1], currPoint],
        totalDistance: calculateHaversineDistance(smoothedPoints[i - 1], currPoint),
        elevationGain: 0,
        startDistanceSinceStart:
          segments.reduce((acc, seg) => acc + seg.totalDistance, 0) +
          calculateHaversineDistance(smoothedPoints[i - 1], currPoint),
      }

      // Reset extreme points for the new segment
      highestEleInSegment = Math.max(smoothedPoints[i - 1].smoothedEle, currentEle)
      lowestEleInSegment = Math.min(smoothedPoints[i - 1].smoothedEle, currentEle)
    } else {
      // Type remains the same -> add point
      currentSegment.points.push(currPoint)
      currentSegment.totalDistance += segmentStepDist
    }
  }

  // Save the last segment
  if (currentSegment.points.length > 0) {
    segments.push(currentSegment)
  }

  // postProcessSegments mutates points in-place (strips smoothedEle), so the
  // returned type is ProcessedSegment[] — cast is safe structurally.
  return postProcessSegments(segments) as any as RawSegment[]
}
