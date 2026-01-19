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
  GetCountriesResponse,
  GetElevationForCoordinatesResponse,
  GetSunriseSunsetForTrailAreaResponse,
  GetTrailAreasResponse,
  GetTrailsOfAreaResponse,
  GetWeatherDataForTrailAreaResponse,
} from './gen/zod'

export const useValidatedCountryList = buildValidatedUseQueryWrapper(useGetCountries, GetCountriesResponse)

export const useValidatedTrailAreas = buildValidatedUseQueryWrapper(useGetTrailAreas, GetTrailAreasResponse)

export const useValidatedTrailsForTrailArea = buildValidatedUseQueryWrapper(useGetTrailsOfArea, GetTrailsOfAreaResponse)

export const useValidatedSunriseSunsetDataForTrailArea = buildValidatedUseQueryWrapper(
  useGetSunriseSunsetForTrailArea,
  GetSunriseSunsetForTrailAreaResponse,
)

export const useValidatedWeatherDataForTrailArea = buildValidatedUseQueryWrapper(
  useGetWeatherDataForTrailArea,
  GetWeatherDataForTrailAreaResponse,
)

export const useValidatedElevationDataForCoordinates = buildValidatedUseQueryWrapper(
  useGetElevationForCoordinates,
  GetElevationForCoordinatesResponse,
)
