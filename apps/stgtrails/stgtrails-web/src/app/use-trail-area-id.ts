import type { TrailAreaResponseDto } from '@plusone/stgtrails-api-client'

export function useTrailAreaId(trailAreas?: Array<TrailAreaResponseDto>, areaId?: string): number | undefined {
  const normalizedAreaId = Number(areaId)
  if (trailAreas?.findIndex((area) => area.id === normalizedAreaId) !== -1) {
    return normalizedAreaId
  }
  return trailAreas ? trailAreas[0].id : undefined
}
