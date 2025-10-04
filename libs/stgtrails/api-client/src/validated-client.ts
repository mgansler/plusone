import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import {
  useGetCountries,
  useGetElevationForCoordinates,
  useGetSunriseSunsetForTrailArea,
  useGetTrailAreas,
  useGetTrailsOfArea,
  useGetWeatherDataForTrailArea,
} from './gen/client'
import {
  getCountriesResponse,
  getElevationForCoordinatesResponse,
  getSunriseSunsetForTrailAreaResponse,
  getTrailAreasResponse,
  getTrailsOfAreaResponse,
  getWeatherDataForTrailAreaResponse,
} from './gen/zod'

export const useValidatedCountryList = buildValidatedUseQueryWrapper(useGetCountries, getCountriesResponse)

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

export const useValidatedElevationDataForCoordinates = buildValidatedUseQueryWrapper(
  useGetElevationForCoordinates,
  getElevationForCoordinatesResponse,
)
