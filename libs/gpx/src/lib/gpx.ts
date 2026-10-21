import { XMLParser } from 'fast-xml-parser'
import { readFileSync } from 'node:fs'
import { calculateHaversineDistance } from './haversine-distance'
import { postProcessSegments } from './post-process-segments'
import { calculateAverageHeartRate } from './calculate-avarage-heart-rate'

const xmlParser = new XMLParser({ ignoreAttributes: false })

export function gpx(path: string): string {
  const fileContent = readFileSync(path, 'utf-8')
  const parsed = xmlParser.parse(fileContent)

  const normalized = parsed.gpx.trk.trkseg.trkpt.map((trkpt: any) => ({
    latitude: parseFloat(trkpt['@_lat']),
    longitude: parseFloat(trkpt['@_lon']),
    elevation: parseFloat(trkpt.ele),
    time: new Date(trkpt.time),
    hr: trkpt.extensions?.['gpxtpx:TrackPointExtension']?.['gpxtpx:hr'],
    cad: trkpt.extensions?.['gpxtpx:TrackPointExtension']?.['gpxtpx:cad'],
  }))

  const segments = processAndSegmentTrack(normalized, { minDistanceMeter: 5, windowSize: 5, thresholdElevation: 10 })

  const overview = segments.map((segment) => {
    const startTime = segment.points[0].time
    const endTime = segment.points[segment.points.length - 1].time
    const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000 // in seconds
    // const durationMinutes = duration / 60 // in minutes
    const distance = Math.round(
      segment.points.reduce((acc, point, index) => {
        if (index === 0) return acc
        return acc + calculateHaversineDistance(segment.points[index - 1], point)
      }, 0),
    )

    const vam = Math.round(segment.elevationGain / (durationSeconds / 3600)) // VAM in m/h

    return {
      type: segment.type,
      points: segment.points.length,
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      durationSeconds,
      duration: `${Math.floor(durationSeconds / 3600)
        .toString()
        .padStart(2, '0')}:${Math.floor((durationSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0')}:${Math.floor(durationSeconds % 60)
        .toString()
        .padStart(2, '0')}`,
      distance,
      startDistanceSinceStart: (segment.startDistanceSinceStart / 1000).toFixed(2),
      endDistanceSinceStart: ((segment.startDistanceSinceStart + distance) / 1000).toFixed(2),
      elevationGain: Math.round(segment.elevationGain),
      vam,
      averageHeartRate: segment.averageHeartRate,
      hfVamQuotient: segment.averageHeartRate && vam > 0 ? (segment.averageHeartRate / vam).toFixed(2) : '',
    }
  })
  console.table(overview)

  const totalDistance = overview.reduce((acc, segment) => acc + segment.distance, 0)
  const totalDuration = overview.reduce((acc, segment) => acc + segment.durationSeconds, 0)

  // Time-weighted average heart rate across all segments
  const allPoints: TrackPoint[] = segments.flatMap((s) => s.points)
  const overallAvgHr = calculateAverageHeartRate(allPoints)

  console.log(`Total distance: ${totalDistance.toFixed(2)} km`)
  console.log(`Total duration: ${(totalDuration / 60).toFixed(2)} min`)
  if (overallAvgHr !== null) console.log(`Overall avg heart rate: ${overallAvgHr} bpm`)

  return 'gpx'
}

type ProcessAndSegmentTrack2Options = {
  minDistanceMeter?: number
  windowSize?: number
  thresholdElevation?: number
}

type SegmentType = 'uphill' | 'downhill' | 'flat' | null
type Segment = {
  type: SegmentType
  points: (TrackPoint & { smoothedEle: number })[]
  totalDistance: number
  elevationGain: number
  averageHeartRate?: number
  averageCadence?: number
  startDistanceSinceStart: number
}

function processAndSegmentTrack(rawPoints: TrackPoint[], options: ProcessAndSegmentTrack2Options = {}) {
  const {
    minDistanceMeter = 4, // Filtert GPS-Zappeln im Stand/Langsamflug
    windowSize = 5, // Glättungsfenster (sollte ungerade sein)
    thresholdElevation = 2, // Reaktivität auf Höhenänderungen
  } = options

  if (rawPoints.length < 2) return []

  // ==========================================
  // SCHRITT 1: Ansatz B – Distanzbasiertes Filtern
  // ==========================================
  const distanceFilteredPoints = [rawPoints[0]]
  let lastValidPoint = rawPoints[0]

  for (let i = 1; i < rawPoints.length; i++) {
    const currentPoint = rawPoints[i]
    const dist = calculateHaversineDistance(lastValidPoint, currentPoint)

    // Nur Punkte behalten, bei denen tatsächlich Strecke zurückgelegt wurde
    if (dist >= minDistanceMeter) {
      distanceFilteredPoints.push(currentPoint)
      lastValidPoint = currentPoint
    }
  }

  // Wenn nach dem Filter zu wenige Punkte übrig sind
  if (distanceFilteredPoints.length < windowSize) {
    if (distanceFilteredPoints.length < 2) return []
    // Fallback: Wenn der Track sehr kurz ist, ohne Glättung segmentieren
  }

  // ==========================================
  // STEP 2: Mathematical Smoothing (Moving Average)
  // ==========================================
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

  // ==========================================
  // STEP 3: Hysteresis Segmentation
  // ==========================================
  const segments: Segment[] = []
  let currentSegment: Segment = {
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

  return postProcessSegments(segments)
}
