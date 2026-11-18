import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import Axios from 'axios'

import {
  BRouterRequestDtoProfile,
  type BRouterRequestDto,
  getRoute2,
  importGpx,
  listRoutes,
  type NearbyRouteResponseDto,
} from '@plusone/gpx-toolbox-api-client'
import {
  calculateHaversineDistance,
  parseGpx,
  type RawSegment,
  segmentTrack,
  serializeGpx,
  type TrackPoint,
} from '@plusone/gpx-toolbox-utils'

import { slicePointsByDistance } from '../utils/track'

const TOKEN_KEY = 'gpx-toolbox-jwt'

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * Fetches the GPX content of a route as plain text.
 * The generated API client does not support this because the backend controller
 * sends the GPX directly as the response body (not as JSON).
 */
async function fetchRouteGpx(id: string): Promise<string> {
  const axios = Axios.create()
  const token = getToken()
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
  const response = await axios.get(`/api/routes/${id}/export`, { responseType: 'blob' })
  return response.data instanceof Blob ? response.data.text() : Promise.resolve('')
}

// ──────────────────────────────────────────────
// Data Models
// ──────────────────────────────────────────────

export type CombineSegment = {
  id: string // unique key: `${routeId}-${segmentIndex}`
  routeId: string
  routeName: string
  segmentIndex: number // Index in segmentTrack result
  type: 'uphill' | 'downhill' | 'flat'
  startKm: number // from segment start (0 = full segment start)
  endKm: number // from segment start (max = full segment end)
  fullSegmentStartKm: number // km position in original track
  fullSegmentEndKm: number
  points: Array<TrackPoint> // points of the full segment
  distance: number // in meters
  elevationGain: number
}

export type GapFill = {
  id: string // unique key: `${prevSegmentId}-to-${nextSegmentId}`
  prevSegmentId: string // ID of the previous segment
  nextSegmentId: string // ID of the next segment
  from: TrackPoint // last point of the previous segment
  to: TrackPoint // first point of the next segment
  viaPoints: Array<TrackPoint> // intermediate waypoints set by the user on the map
  routePoints?: Array<TrackPoint> // points after BRouter calculation
  loading: boolean // currently being calculated
  error?: string // error message
  distance?: number // estimated distance in meters
}

export type SourceRouteWithSegments = {
  route: NearbyRouteResponseDto
  gpxContent: string
  points: Array<TrackPoint>
  segments: Array<RawSegment>
}

// ──────────────────────────────────────────────
// Shared Store — single source of truth for all useCombineState callers
// ──────────────────────────────────────────────

type CombineStore = {
  allRoutes: Array<NearbyRouteResponseDto>
  routesLoading: boolean
  sourceRouteIds: Set<string>
  sourceRoutes: Map<string, SourceRouteWithSegments>
  sourcesLoading: boolean
  orderedSegments: Array<CombineSegment>
  gapFills: Array<GapFill>
  hoveredSegmentId: string | null
  hoveredGapFillId: string | null
  combining: boolean
  combineError: string | null
}

const listeners = new Set<() => void>()

let store: CombineStore = {
  allRoutes: [],
  routesLoading: false,
  sourceRouteIds: new Set(),
  sourceRoutes: new Map(),
  sourcesLoading: false,
  orderedSegments: [],
  gapFills: [],
  hoveredSegmentId: null,
  hoveredGapFillId: null,
  combining: false,
  combineError: null,
}

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): CombineStore {
  return store
}

// ──────────────────────────────────────────────
// Public API for tests
// ──────────────────────────────────────────────

export const combineState = {
  reset() {
    store = {
      allRoutes: [],
      routesLoading: false,
      sourceRouteIds: new Set(),
      sourceRoutes: new Map(),
      sourcesLoading: false,
      orderedSegments: [],
      gapFills: [],
      hoveredSegmentId: null,
      hoveredGapFillId: null,
      combining: false,
      combineError: null,
    }
    notify()
  },
}

// ──────────────────────────────────────────────
// Store actions (called from inside the hook)
// ──────────────────────────────────────────────

function setAllRoutes(routes: Array<NearbyRouteResponseDto>) {
  store = { ...store, allRoutes: routes }
  notify()
}

function setRoutesLoading(loading: boolean) {
  store = { ...store, routesLoading: loading }
  notify()
}

function setSourceRouteIds(ids: Set<string>) {
  store = { ...store, sourceRouteIds: ids }
  notify()
}

function setSourceRoutes(
  updater:
    | Map<string, SourceRouteWithSegments>
    | ((prev: Map<string, SourceRouteWithSegments>) => Map<string, SourceRouteWithSegments>),
) {
  const next = typeof updater === 'function' ? updater(store.sourceRoutes) : updater
  store = { ...store, sourceRoutes: next }
  notify()
}

function setSourcesLoading(loading: boolean) {
  store = { ...store, sourcesLoading: loading }
  notify()
}

function setOrderedSegments(segments: Array<CombineSegment>) {
  store = { ...store, orderedSegments: segments }
  notify()
}

function setCombining(combining: boolean) {
  store = { ...store, combining }
  notify()
}

function setCombineError(error: string | null) {
  store = { ...store, combineError: error }
  notify()
}

function setHoveredSegmentId(id: string | null) {
  store = { ...store, hoveredSegmentId: id }
  notify()
}

function setHoveredGapFillId(id: string | null) {
  store = { ...store, hoveredGapFillId: id }
  notify()
}

function setGapFills(fills: Array<GapFill>) {
  store = { ...store, gapFills: fills }
  notify()
}

function updateGapFill(id: string, updater: (fill: GapFill) => GapFill) {
  store = {
    ...store,
    gapFills: store.gapFills.map((f) => (f.id === id ? updater(f) : f)),
  }
  notify()
}

// ─── GapFill Calculation ───

/**
 * Estimates the gap between two points as a rough distance in meters.
 */
function estimateGapDistance(from: TrackPoint, to: TrackPoint): number {
  return Math.sqrt(Math.pow(to.latitude - from.latitude, 2) + Math.pow(to.longitude - from.longitude, 2)) * 111000
}

/**
 * Computes the GapFills based on the current segment order.
 * A GapFill is created for each adjacent segment pair when the distance > 100m.
 * Existing GapFills are reused when the same segment pair still exists, preserving routePoints and viaPoints.
 * When segment order changes, all GapFills are reset (routePoints cleared) since the gaps have changed.
 */
function computeGapFills(segments: Array<CombineSegment>, existingFills: Array<GapFill>): Array<GapFill> {
  const fills: Array<GapFill> = []
  // Build a map of existing fills by their segment pair key for lookup
  const existingMap = new Map<string, GapFill>()
  for (const fill of existingFills) {
    existingMap.set(`${fill.prevSegmentId}-${fill.nextSegmentId}`, fill)
  }

  for (let i = 1; i < segments.length; i++) {
    const prevSegment = segments[i - 1]
    const nextSegment = segments[i]

    const prevPoints = slicePointsByDistance(prevSegment.points, [
      prevSegment.startKm,
      Math.min(prevSegment.endKm, prevSegment.distance / 1000),
    ])
    const nextPoints = slicePointsByDistance(nextSegment.points, [
      nextSegment.startKm,
      Math.min(nextSegment.endKm, nextSegment.distance / 1000),
    ])

    if (prevPoints.length === 0 || nextPoints.length === 0) continue

    const from = prevPoints[prevPoints.length - 1]
    const to = nextPoints[0]

    const distance = estimateGapDistance(from, to)

    // Only if the gap > 100m, we need a route
    if (distance > 100) {
      const pairKey = `${prevSegment.id}-${nextSegment.id}`
      const existing = existingMap.get(pairKey)

      // Check if from/to coordinates changed — if so, discard old route
      let preservedRoute: Array<TrackPoint> | undefined
      let preservedVia: Array<TrackPoint> = []
      if (existing) {
        preservedVia = existing.viaPoints
        // Only preserve routePoints if from/to haven't changed
        if (
          existing.from.latitude === from.latitude &&
          existing.from.longitude === from.longitude &&
          existing.to.latitude === to.latitude &&
          existing.to.longitude === to.longitude
        ) {
          preservedRoute = existing.routePoints
        }
      }

      fills.push({
        id: `${prevSegment.id}-to-${nextSegment.id}`,
        prevSegmentId: prevSegment.id,
        nextSegmentId: nextSegment.id,
        from,
        to,
        viaPoints: preservedVia,
        routePoints: preservedRoute,
        loading: false,
        error: undefined,
        distance,
      })
    }
  }

  return fills
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useCombineState() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  // Keep a ref to avoid re-creating the load effect on every snapshot change
  const loadInProgress = useRef(false)

  // ─── Load all available routes (once per session) ───

  useEffect(() => {
    if (loadInProgress.current) return
    loadInProgress.current = true

    setRoutesLoading(true)
    listRoutes()
      .then((response) => {
        const items = response.items ?? []
        setAllRoutes(items)
      })
      .finally(() => {
        setRoutesLoading(false)
      })
  }, [])

  // ─── Pre-selection from compare list ───

  const initSourceRouteIds = useCallback((routeIds: Array<string>) => {
    if (routeIds.length === 0) return
    setSourceRouteIds(new Set(routeIds))
  }, [])

  // ─── Select/remove sources ───

  const toggleSourceRoute = useCallback((routeId: string) => {
    const next = new Set(store.sourceRouteIds)
    if (next.has(routeId)) {
      next.delete(routeId)
      setSourceRouteIds(next)
      // Also remove the loaded data and associated segments
      const nextSources = new Map(store.sourceRoutes)
      nextSources.delete(routeId)
      setSourceRoutes(nextSources)
      setOrderedSegments(store.orderedSegments.filter((s) => s.routeId !== routeId))
    } else {
      next.add(routeId)
      setSourceRouteIds(next)
    }
  }, [])

  const isSourceSelected = useCallback((routeId: string) => store.sourceRouteIds.has(routeId), [])

  // ─── Load GPX content of sources and segmentize ───

  const loadSourceGpx = useCallback(async (routeId: string) => {
    try {
      const gpxText = await fetchRouteGpx(routeId)
      const points = parseGpx(gpxText)
      const segments = segmentTrack(points)

      // Try to find route info in allRoutes; if not found, look up from compare list
      let routeInfo = store.allRoutes.find((r) => r.id === routeId)
      if (!routeInfo) {
        // Fallback: read name from the compare list (localStorage)
        try {
          const compareStorage = localStorage.getItem('gpx-toolbox-compare')
          if (compareStorage) {
            const compareItems = JSON.parse(compareStorage) as Array<{ id: string; name: string }>
            const compareItem = compareItems.find((item) => item.id === routeId)
            if (compareItem?.name) {
              routeInfo = { id: routeId, name: compareItem.name } as NearbyRouteResponseDto
            }
          }
        } catch {
          /* ignore */
        }

        // Last resort: minimal placeholder
        if (!routeInfo) {
          routeInfo = { id: routeId, name: 'Unknown Route' } as NearbyRouteResponseDto
        }
      }

      // Use functional updater to avoid race conditions with parallel calls
      // Each call builds on the previous state, not on the stale store snapshot
      setSourceRoutes((prev) => {
        const next = new Map(prev)
        next.set(routeId, {
          route: routeInfo,
          gpxContent: gpxText,
          points,
          segments,
        })
        return next
      })
    } catch (err) {
      console.error('[Combine] loadSourceGpx error for:', routeId, err)
    } finally {
      // Only turn off loading when all sources are loaded
      setSourcesLoading(false)
    }
  }, [])

  // Load GPX for all selected sources
  // Wait until routesLoading is false (allRoutes loaded)
  const sourceRouteIdsKey = useMemo(
    () => Array.from(store.sourceRouteIds).sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.sourceRouteIds],
  )

  useEffect(() => {
    const ids = Array.from(store.sourceRouteIds)
    if (ids.length === 0) {
      return
    }

    // Wait until allRoutes is loaded
    if (store.routesLoading) {
      return
    }

    // Only load routes that haven't been loaded in sourceRoutes yet
    const toLoad = ids.filter((id) => !store.sourceRoutes.has(id))
    if (toLoad.length === 0) {
      return
    }

    const loads: Array<Promise<void>> = []
    toLoad.forEach((routeId) => {
      loads.push(loadSourceGpx(routeId))
    })
    if (loads.length > 0) {
      Promise.all(loads)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceRouteIdsKey, loadSourceGpx, store.routesLoading])

  // ─── Segment Management ───

  const addSegment = useCallback((routeId: string, segmentIndex: number, segment: RawSegment) => {
    const source = store.sourceRoutes.get(routeId)
    if (!source) return

    const segId = `${routeId}-${segmentIndex}`
    const currentSegments = store.orderedSegments
    if (currentSegments.some((s) => s.id === segId)) return
    setOrderedSegments([
      ...currentSegments,
      {
        id: segId,
        routeId,
        routeName: source.route.name,
        segmentIndex,
        type: (segment.type ?? 'flat') as 'uphill' | 'downhill' | 'flat',
        startKm: 0,
        endKm: segment.totalDistance / 1000, // in km
        fullSegmentStartKm: segment.startDistanceSinceStart / 1000,
        fullSegmentEndKm: (segment.startDistanceSinceStart + segment.totalDistance) / 1000,
        points: segment.points,
        distance: segment.totalDistance,
        elevationGain: segment.elevationGain ?? 0,
      },
    ])
  }, [])

  const removeSegment = useCallback((segmentId: string) => {
    setOrderedSegments(store.orderedSegments.filter((s) => s.id !== segmentId))
  }, [])

  const moveSegment = useCallback((fromIndex: number, toIndex: number) => {
    const next = [...store.orderedSegments]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setOrderedSegments(next)
  }, [])

  const moveSegmentUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      moveSegment(index, index - 1)
    },
    [moveSegment],
  )

  const moveSegmentDown = useCallback(
    (index: number) => {
      if (index >= store.orderedSegments.length - 1) return
      moveSegment(index, index + 1)
    },
    [moveSegment],
  )

  const updateSegmentRange = useCallback((segmentId: string, startKm: number, endKm: number) => {
    setOrderedSegments(store.orderedSegments.map((s) => (s.id === segmentId ? { ...s, startKm, endKm } : s)))
  }, [])

  // ─── Extract segment points (based on startKm/endKm) ───

  const getSegmentPoints = useCallback((segment: CombineSegment): Array<TrackPoint> => {
    const segmentDistance = segment.distance / 1000 // in km
    return slicePointsByDistance(segment.points, [segment.startKm, Math.min(segment.endKm, segmentDistance)])
  }, [])

  // ─── Automatically compute GapFills on segment order or range changes ───

  useEffect(() => {
    const fills = computeGapFills(store.orderedSegments, store.gapFills)
    setGapFills(fills)
    // Re-compute when segment order changes OR when startKm/endKm of any segment changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.orderedSegments.map((s) => `${s.id}:${s.startKm}:${s.endKm}`).join(',')])

  // ─── BRouter: compute route for a single GapFill ───

  const computeGapFillRoute = useCallback(
    async (gapFillId: string, profile: BRouterRequestDtoProfile = BRouterRequestDtoProfile['mtb-zossebart']) => {
      const fill = store.gapFills.find((f) => f.id === gapFillId)
      if (!fill || fill.loading) return

      updateGapFill(gapFillId, (f) => ({ ...f, loading: true, error: undefined }))

      try {
        const allPoints = [
          { latitude: fill.from.latitude, longitude: fill.from.longitude },
          ...fill.viaPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
          { latitude: fill.to.latitude, longitude: fill.to.longitude },
        ]
        const brouterRequest: BRouterRequestDto = {
          points: allPoints,
          profile,
        }
        const brouterResponse = await getRoute2(brouterRequest)
        const gapPoints = parseGpx(brouterResponse.gpx)
        updateGapFill(gapFillId, (f) => ({ ...f, routePoints: gapPoints, loading: false }))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error during route calculation'
        updateGapFill(gapFillId, (f) => ({ ...f, loading: false, error: message }))
      }
    },
    [],
  )

  // ─── Via points for GapFills ───

  const addGapFillViaPoint = useCallback((gapFillId: string, point: TrackPoint) => {
    updateGapFill(gapFillId, (f) => ({
      ...f,
      viaPoints: [...f.viaPoints, point],
      routePoints: undefined, // Route must be recalculated
    }))
  }, [])

  const removeGapFillViaPoint = useCallback((gapFillId: string, viaIndex: number) => {
    updateGapFill(gapFillId, (f) => ({
      ...f,
      viaPoints: f.viaPoints.filter((_, i) => i !== viaIndex),
      routePoints: undefined, // Route must be recalculated
    }))
  }, [])

  const updateGapFillViaPoint = useCallback((gapFillId: string, viaIndex: number, point: TrackPoint) => {
    updateGapFill(gapFillId, (f) => ({
      ...f,
      viaPoints: f.viaPoints.map((p, i) => (i === viaIndex ? point : p)),
      routePoints: undefined, // Route must be recalculated
    }))
  }, [])

  // ─── Combine ───

  const combineRoutes = useCallback(
    async (
      name: string,
      profile: BRouterRequestDtoProfile = BRouterRequestDtoProfile.fastbike,
    ): Promise<string | null> => {
      if (store.orderedSegments.length === 0) return null

      setCombining(true)
      setCombineError(null)

      try {
        const allPoints: Array<TrackPoint> = []

        for (let i = 0; i < store.orderedSegments.length; i++) {
          const segment = store.orderedSegments[i]
          const points = getSegmentPoints(segment)

          if (points.length === 0) continue

          // Fill gap to previous segment — use GapFill from the store
          if (i > 0 && allPoints.length > 0) {
            const gapFill = store.gapFills.find((f) => f.nextSegmentId === segment.id)

            if (gapFill) {
              // If already calculated, use the stored points
              if (gapFill.routePoints && gapFill.routePoints.length > 1) {
                allPoints.push(...gapFill.routePoints.slice(1))
              } else {
                // Not yet calculated — calculate now
                const brouterPoints = [
                  { latitude: gapFill.from.latitude, longitude: gapFill.from.longitude },
                  ...gapFill.viaPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
                  { latitude: gapFill.to.latitude, longitude: gapFill.to.longitude },
                ]
                const brouterRequest: BRouterRequestDto = {
                  points: brouterPoints,
                  profile,
                }

                const brouterResponse = await getRoute2(brouterRequest)
                const gapPoints = parseGpx(brouterResponse.gpx)

                if (gapPoints.length > 1) {
                  allPoints.push(...gapPoints.slice(1))
                }
              }
            }
          }

          allPoints.push(...points)
        }

        if (allPoints.length < 2) {
          setCombineError('Not enough points for a route')
          return null
        }

        // Create and save GPX
        const gpxContent = serializeGpx(allPoints, name)
        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
        const file = new File([blob], 'combined.gpx', { type: 'application/gpx+xml' })

        const result = await importGpx({ name, file })
        return result.id
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error while combining routes'
        setCombineError(message)
        return null
      } finally {
        setCombining(false)
      }
    },
    [getSegmentPoints],
  )

  // ─── Derived values ───

  const selectedSourceRoutes = useMemo(() => {
    return store.allRoutes.filter((r) => store.sourceRouteIds.has(r.id))
  }, [store.allRoutes, store.sourceRouteIds])

  const totalDistance = useMemo(() => {
    // Distance of selected segments
    let segmentDistance = store.orderedSegments.reduce((sum, s) => {
      const segmentDistance = s.distance / 1000 // in km
      const usedDistance = Math.min(s.endKm, segmentDistance) - s.startKm
      return sum + usedDistance * 1000 // back to meters
    }, 0)

    // Add distance of calculated GapFills
    for (const gapFill of store.gapFills) {
      if (gapFill.routePoints && gapFill.routePoints.length >= 2) {
        for (let i = 1; i < gapFill.routePoints.length; i++) {
          segmentDistance += calculateHaversineDistance(gapFill.routePoints[i - 1], gapFill.routePoints[i])
        }
      }
    }

    return segmentDistance
  }, [store.orderedSegments, store.gapFills])

  /**
   * Returns all points of the combined route in the correct order.
   * Segments are added in the order of orderedSegments,
   * with GapFills in between (if already calculated).
   * Uncalculated GapFills are shown as a direct connection (straight line).
   */
  const getCombinedRoutePoints = useCallback((): Array<TrackPoint> => {
    const allPoints: Array<TrackPoint> = []

    for (let i = 0; i < store.orderedSegments.length; i++) {
      const segment = store.orderedSegments[i]
      const points = getSegmentPoints(segment)

      if (points.length === 0) continue

      // Fill gap to previous segment
      if (i > 0 && allPoints.length > 0) {
        const gapFill = store.gapFills.find((f) => f.nextSegmentId === segment.id)

        if (gapFill) {
          // If already calculated, use the stored points
          if (gapFill.routePoints && gapFill.routePoints.length > 1) {
            allPoints.push(...gapFill.routePoints.slice(1))
          } else {
            // Not yet calculated — direct connection as placeholder
            // Add the first point of the next segment (straight line)
            // The last point of the previous segment is already in allPoints
          }
        }
      }

      allPoints.push(...points)
    }

    return allPoints
  }, [store.orderedSegments, store.gapFills, getSegmentPoints])

  return {
    // Routes
    allRoutes: store.allRoutes,
    routesLoading: store.routesLoading,
    selectedSourceRoutes,

    // Sources
    sourceRouteIds: store.sourceRouteIds,
    sourceRoutes: store.sourceRoutes,
    sourcesLoading: store.sourcesLoading,
    initSourceRouteIds,
    toggleSourceRoute,
    isSourceSelected,

    // Segments
    orderedSegments: store.orderedSegments,
    hoveredSegmentId: store.hoveredSegmentId,
    hoveredGapFillId: store.hoveredGapFillId,
    setHoveredSegmentId,
    setHoveredGapFillId,
    addSegment,
    removeSegment,
    moveSegment,
    moveSegmentUp,
    moveSegmentDown,
    updateSegmentRange,
    getSegmentPoints,

    // GapFills
    gapFills: store.gapFills,
    computeGapFillRoute,
    addGapFillViaPoint,
    removeGapFillViaPoint,
    updateGapFillViaPoint,

    // Combine
    combining: store.combining,
    combineError: store.combineError,
    combineRoutes,

    // Derived values
    totalDistance,
    getCombinedRoutePoints,
  }
}
