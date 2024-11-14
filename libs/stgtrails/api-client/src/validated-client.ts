import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import {
  useGetSunriseSunsetForTrailArea,
  useGetTrailAreas,
  useGetTrailsOfArea,
  useGetWeatherDataForTrailArea,
} from './gen/client'
import {
  getSunriseSunsetForTrailAreaResponse,
  getTrailAreasResponse,
  getTrailsOfAreaResponse,
  getWeatherDataForTrailAreaResponse,
} from './gen/zod'

export const useValidatedTrailAreas = buildValidatedUseQueryWrapper(useGetTrailAreas, getTrailAreasResponse)

export const useValidatedTrailsForTrailArea = buildValidatedUseQueryWrapper(useGetTrailsOfArea, getTrailsOfAreaResponse)

export const useValidatedSunriseSunsetDataForTrailArea = buildValidatedUseQueryWrapper(
  useGetSunriseSunsetForTrailArea,
  getSunriseSunsetForTrailAreaResponse,
)

export const useValidatedWeatherDataForTrailArea = buildValidatedUseQueryWrapper(
  useGetWeatherDataForTrailArea,
  getWeatherDataForTrailAreaResponse,
)
