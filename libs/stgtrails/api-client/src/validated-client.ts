import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import { useGetTrailAreas, useGetTrailsOfArea, useGetWeatherDataForTrailArea } from './client'
import { getTrailAreasResponse, getTrailsOfAreaResponse, getWeatherDataForTrailAreaResponse } from './zod'

export const useValidatedTrailAreas = buildValidatedUseQueryWrapper(useGetTrailAreas, getTrailAreasResponse)

export const useValidatedWeatherDataForTrailArea = buildValidatedUseQueryWrapper(
  useGetWeatherDataForTrailArea,
  getWeatherDataForTrailAreaResponse,
)
export const useValidatedTrailsForTrailArea = buildValidatedUseQueryWrapper(useGetTrailsOfArea, getTrailsOfAreaResponse)
