export type TrackPoint = {
  latitude: number
  longitude: number
  elevation: number
  time: Date
  hr?: number
  cad?: number
}

export type SmootherOptions = {
  minDistanceMeter?: number
  windowSize?: number
  thresholdElevation?: number
}

export type SegmentType = 'uphill' | 'downhill' | 'flat' | null

export type RawSegment = {
  type: SegmentType
  points: Array<TrackPoint & { smoothedEle: number }>
  totalDistance: number
  elevationGain: number
  averageHeartRate?: number
  averageCadence?: number
  startDistanceSinceStart: number
}

export type ProcessedSegment = {
  type: SegmentType
  points: TrackPoint[]
  totalDistance: number
  elevationGain: number
  averageHeartRate?: number
  averageCadence?: number
  startDistanceSinceStart: number
}

export type SegmentOverview = {
  type: SegmentType
  points: number
  startTime: string
  endTime: string
  durationSeconds: number
  duration: string
  distance: number
  startDistanceSinceStart: string
  endDistanceSinceStart: string
  elevationGain: number
  vam: number
  averageHeartRate?: number
  hfVamQuotient: string
}

export type TrackOverview = {
  segments: SegmentOverview[]
  totalDistance: number
  totalDuration: number
  overallAvgHeartRate: number | null
}
