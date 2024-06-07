/**
 * Generated by orval v6.30.2 🍺
 * Do not edit manually.
 * Elgato API
 * OpenAPI spec version: 0.1
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { customAxiosInstance } from './custom-axios'
export interface ActionResponseDto {
  /** @nullable */
  brightness?: number | null
  commandId: number
  /** @nullable */
  hue?: number | null
  id: number
  macAddress: string
  on: boolean
  powerOnly: boolean
  /** @nullable */
  saturation?: number | null
  /** @nullable */
  temperature?: number | null
}

export interface CommandResponseDto {
  actions: ActionResponseDto[]
  hash: string
  id: number
  name: string
}

export interface CommandsListResponseDto {
  commands: CommandResponseDto[]
}

export interface ActionRequestDto {
  /** @nullable */
  brightness?: number | null
  /** @nullable */
  hue?: number | null
  macAddress: string
  on: boolean
  powerOnly: boolean
  /** @nullable */
  saturation?: number | null
  /** @nullable */
  temperature?: number | null
}

export interface CommandRequestDto {
  actions: ActionRequestDto[]
  name: string
}

export interface LocationDataResponseDto {
  dawn: string
  /** Time between sunrise and sunset in seconds. */
  dayLength: number
  dusk: string
  firstLight: string
  goldenHour: string
  lastLight: string
  latitude: number
  longitude: number
  name: string
  solarNoon: string
  sunrise: string
  sunset: string
  timeZone: string
  utcOffset: number
}

export interface LocationResponseDto {
  latitude: number
  longitude: number
  name: string
}

export interface LocationUpdateRequestDto {
  latitude: number
  longitude: number
  name: string
}

export interface DeviceSettingsRequestDto {
  sunrise?: boolean
  sunset?: boolean
}

export interface DeviceSettingsResponseDto {
  sunrise: boolean
  sunset: boolean
}

export interface TransitionToColorRequestDto {
  brightness: number
  hue: number
  saturation: number
}

export interface DevicePowerStateRequestDto {
  /** @nullable */
  brightness?: number | null
  /** @nullable */
  hue?: number | null
  on: boolean
  /** @nullable */
  saturation?: number | null
  /** @nullable */
  temperature?: number | null
}

export interface DeviceDisplayNameRequestDto {
  displayName: string
}

export interface DeviceState {
  /** @nullable */
  brightness?: number | null
  /** @nullable */
  hue?: number | null
  on: boolean
  /** @nullable */
  saturation?: number | null
  /** @nullable */
  temperature?: number | null
}

export interface DeviceDetailsResponseDto {
  details: ElgatoDeviceDetailsResponseDto
  displayName: string
  lastSeen: string
  /** The unique id for the device is its mac address. */
  macAddress: string
  state: DeviceState
}

export interface DeviceResponseDto {
  displayName: string
  /** The unique id for the device is its mac address. */
  macAddress: string
}

export interface DeviceListResponseDto {
  devices: DeviceResponseDto[]
}

export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DeviceType = {
  RingLight: 'RingLight',
  LightStrip: 'LightStrip',
  Unknown: 'Unknown',
} as const

export interface ElgatoDeviceDetailsResponseDto {
  deviceType: DeviceType
  displayName: string
  productName: string
}

export interface DiscoveredDeviceResponseDto {
  displayName: string
  fqdn: string
  host: string
  /** The mac address of the device. */
  id: string
  ipv4: string
  isControlled: boolean
  macAddress: string
  name: string
  port: number
  productName: string
  type: DeviceType
}

export interface DiscoveredDevicesResponseDto {
  devices: DiscoveredDeviceResponseDto[]
}

export const discoveredDevices = (signal?: AbortSignal) => {
  return customAxiosInstance<DiscoveredDevicesResponseDto>({ url: `/api/discovery/devices`, method: 'GET', signal })
}

export const getDiscoveredDevicesQueryKey = () => {
  return [`/api/discovery/devices`] as const
}

export const getDiscoveredDevicesQueryOptions = <
  TData = Awaited<ReturnType<typeof discoveredDevices>>,
  TError = unknown,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof discoveredDevices>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getDiscoveredDevicesQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof discoveredDevices>>> = ({ signal }) =>
    discoveredDevices(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof discoveredDevices>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type DiscoveredDevicesQueryResult = NonNullable<Awaited<ReturnType<typeof discoveredDevices>>>
export type DiscoveredDevicesQueryError = unknown

export const useDiscoveredDevices = <
  TData = Awaited<ReturnType<typeof discoveredDevices>>,
  TError = unknown,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof discoveredDevices>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getDiscoveredDevicesQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const addDiscoveredDevice = (deviceId: string) => {
  return customAxiosInstance<void>({ url: `/api/discovery/add-by-id/${deviceId}`, method: 'POST' })
}

export const getAddDiscoveredDeviceMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof addDiscoveredDevice>>, TError, { deviceId: string }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof addDiscoveredDevice>>, TError, { deviceId: string }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof addDiscoveredDevice>>, { deviceId: string }> = (
    props,
  ) => {
    const { deviceId } = props ?? {}

    return addDiscoveredDevice(deviceId)
  }

  return { mutationFn, ...mutationOptions }
}

export type AddDiscoveredDeviceMutationResult = NonNullable<Awaited<ReturnType<typeof addDiscoveredDevice>>>

export type AddDiscoveredDeviceMutationError = unknown

export const useAddDiscoveredDevice = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof addDiscoveredDevice>>, TError, { deviceId: string }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof addDiscoveredDevice>>, TError, { deviceId: string }, TContext> => {
  const mutationOptions = getAddDiscoveredDeviceMutationOptions(options)

  return useMutation(mutationOptions)
}

export const addManualDevice = (address: string) => {
  return customAxiosInstance<void>({ url: `/api/discovery/add-by-address/${address}`, method: 'POST' })
}

export const getAddManualDeviceMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof addManualDevice>>, TError, { address: string }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof addManualDevice>>, TError, { address: string }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof addManualDevice>>, { address: string }> = (props) => {
    const { address } = props ?? {}

    return addManualDevice(address)
  }

  return { mutationFn, ...mutationOptions }
}

export type AddManualDeviceMutationResult = NonNullable<Awaited<ReturnType<typeof addManualDevice>>>

export type AddManualDeviceMutationError = unknown

export const useAddManualDevice = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof addManualDevice>>, TError, { address: string }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof addManualDevice>>, TError, { address: string }, TContext> => {
  const mutationOptions = getAddManualDeviceMutationOptions(options)

  return useMutation(mutationOptions)
}

export const deviceList = (signal?: AbortSignal) => {
  return customAxiosInstance<DeviceListResponseDto>({ url: `/api/devices`, method: 'GET', signal })
}

export const getDeviceListQueryKey = () => {
  return [`/api/devices`] as const
}

export const getDeviceListQueryOptions = <TData = Awaited<ReturnType<typeof deviceList>>, TError = unknown>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof deviceList>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getDeviceListQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof deviceList>>> = ({ signal }) => deviceList(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof deviceList>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type DeviceListQueryResult = NonNullable<Awaited<ReturnType<typeof deviceList>>>
export type DeviceListQueryError = unknown

export const useDeviceList = <TData = Awaited<ReturnType<typeof deviceList>>, TError = unknown>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof deviceList>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getDeviceListQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const deviceDetails = (macAddress: string, signal?: AbortSignal) => {
  return customAxiosInstance<DeviceDetailsResponseDto>({ url: `/api/devices/${macAddress}`, method: 'GET', signal })
}

export const getDeviceDetailsQueryKey = (macAddress: string) => {
  return [`/api/devices/${macAddress}`] as const
}

export const getDeviceDetailsQueryOptions = <TData = Awaited<ReturnType<typeof deviceDetails>>, TError = unknown>(
  macAddress: string,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof deviceDetails>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getDeviceDetailsQueryKey(macAddress)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof deviceDetails>>> = ({ signal }) =>
    deviceDetails(macAddress, signal)

  return { queryKey, queryFn, enabled: !!macAddress, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof deviceDetails>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type DeviceDetailsQueryResult = NonNullable<Awaited<ReturnType<typeof deviceDetails>>>
export type DeviceDetailsQueryError = unknown

export const useDeviceDetails = <TData = Awaited<ReturnType<typeof deviceDetails>>, TError = unknown>(
  macAddress: string,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof deviceDetails>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getDeviceDetailsQueryOptions(macAddress, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const setDisplayName = (macAddress: string, deviceDisplayNameRequestDto: DeviceDisplayNameRequestDto) => {
  return customAxiosInstance<void>({
    url: `/api/devices/${macAddress}/display-name`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: deviceDisplayNameRequestDto,
  })
}

export const getSetDisplayNameMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof setDisplayName>>,
    TError,
    { macAddress: string; data: DeviceDisplayNameRequestDto },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof setDisplayName>>,
  TError,
  { macAddress: string; data: DeviceDisplayNameRequestDto },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof setDisplayName>>,
    { macAddress: string; data: DeviceDisplayNameRequestDto }
  > = (props) => {
    const { macAddress, data } = props ?? {}

    return setDisplayName(macAddress, data)
  }

  return { mutationFn, ...mutationOptions }
}

export type SetDisplayNameMutationResult = NonNullable<Awaited<ReturnType<typeof setDisplayName>>>
export type SetDisplayNameMutationBody = DeviceDisplayNameRequestDto
export type SetDisplayNameMutationError = unknown

export const useSetDisplayName = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof setDisplayName>>,
    TError,
    { macAddress: string; data: DeviceDisplayNameRequestDto },
    TContext
  >
}): UseMutationResult<
  Awaited<ReturnType<typeof setDisplayName>>,
  TError,
  { macAddress: string; data: DeviceDisplayNameRequestDto },
  TContext
> => {
  const mutationOptions = getSetDisplayNameMutationOptions(options)

  return useMutation(mutationOptions)
}

export const toggleDevice = (macAddress: string) => {
  return customAxiosInstance<void>({ url: `/api/devices/${macAddress}/toggle`, method: 'PUT' })
}

export const getToggleDeviceMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleDevice>>, TError, { macAddress: string }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof toggleDevice>>, TError, { macAddress: string }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof toggleDevice>>, { macAddress: string }> = (props) => {
    const { macAddress } = props ?? {}

    return toggleDevice(macAddress)
  }

  return { mutationFn, ...mutationOptions }
}

export type ToggleDeviceMutationResult = NonNullable<Awaited<ReturnType<typeof toggleDevice>>>

export type ToggleDeviceMutationError = unknown

export const useToggleDevice = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleDevice>>, TError, { macAddress: string }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof toggleDevice>>, TError, { macAddress: string }, TContext> => {
  const mutationOptions = getToggleDeviceMutationOptions(options)

  return useMutation(mutationOptions)
}

export const deviceSetPowerState = (macAddress: string, devicePowerStateRequestDto: DevicePowerStateRequestDto) => {
  return customAxiosInstance<void>({
    url: `/api/devices/${macAddress}/power-state`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: devicePowerStateRequestDto,
  })
}

export const getDeviceSetPowerStateMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deviceSetPowerState>>,
    TError,
    { macAddress: string; data: DevicePowerStateRequestDto },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof deviceSetPowerState>>,
  TError,
  { macAddress: string; data: DevicePowerStateRequestDto },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deviceSetPowerState>>,
    { macAddress: string; data: DevicePowerStateRequestDto }
  > = (props) => {
    const { macAddress, data } = props ?? {}

    return deviceSetPowerState(macAddress, data)
  }

  return { mutationFn, ...mutationOptions }
}

export type DeviceSetPowerStateMutationResult = NonNullable<Awaited<ReturnType<typeof deviceSetPowerState>>>
export type DeviceSetPowerStateMutationBody = DevicePowerStateRequestDto
export type DeviceSetPowerStateMutationError = unknown

export const useDeviceSetPowerState = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deviceSetPowerState>>,
    TError,
    { macAddress: string; data: DevicePowerStateRequestDto },
    TContext
  >
}): UseMutationResult<
  Awaited<ReturnType<typeof deviceSetPowerState>>,
  TError,
  { macAddress: string; data: DevicePowerStateRequestDto },
  TContext
> => {
  const mutationOptions = getDeviceSetPowerStateMutationOptions(options)

  return useMutation(mutationOptions)
}

export const transitionToColor = (macAddress: string, transitionToColorRequestDto: TransitionToColorRequestDto) => {
  return customAxiosInstance<void>({
    url: `/api/devices/${macAddress}/transition-to-color`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: transitionToColorRequestDto,
  })
}

export const getTransitionToColorMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof transitionToColor>>,
    TError,
    { macAddress: string; data: TransitionToColorRequestDto },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof transitionToColor>>,
  TError,
  { macAddress: string; data: TransitionToColorRequestDto },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof transitionToColor>>,
    { macAddress: string; data: TransitionToColorRequestDto }
  > = (props) => {
    const { macAddress, data } = props ?? {}

    return transitionToColor(macAddress, data)
  }

  return { mutationFn, ...mutationOptions }
}

export type TransitionToColorMutationResult = NonNullable<Awaited<ReturnType<typeof transitionToColor>>>
export type TransitionToColorMutationBody = TransitionToColorRequestDto
export type TransitionToColorMutationError = unknown

export const useTransitionToColor = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof transitionToColor>>,
    TError,
    { macAddress: string; data: TransitionToColorRequestDto },
    TContext
  >
}): UseMutationResult<
  Awaited<ReturnType<typeof transitionToColor>>,
  TError,
  { macAddress: string; data: TransitionToColorRequestDto },
  TContext
> => {
  const mutationOptions = getTransitionToColorMutationOptions(options)

  return useMutation(mutationOptions)
}

export const currentDeviceSettings = (macAddress: string, signal?: AbortSignal) => {
  return customAxiosInstance<DeviceSettingsResponseDto>({
    url: `/api/devices/${macAddress}/settings`,
    method: 'GET',
    signal,
  })
}

export const getCurrentDeviceSettingsQueryKey = (macAddress: string) => {
  return [`/api/devices/${macAddress}/settings`] as const
}

export const getCurrentDeviceSettingsQueryOptions = <
  TData = Awaited<ReturnType<typeof currentDeviceSettings>>,
  TError = unknown,
>(
  macAddress: string,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof currentDeviceSettings>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getCurrentDeviceSettingsQueryKey(macAddress)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof currentDeviceSettings>>> = ({ signal }) =>
    currentDeviceSettings(macAddress, signal)

  return { queryKey, queryFn, enabled: !!macAddress, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof currentDeviceSettings>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type CurrentDeviceSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof currentDeviceSettings>>>
export type CurrentDeviceSettingsQueryError = unknown

export const useCurrentDeviceSettings = <TData = Awaited<ReturnType<typeof currentDeviceSettings>>, TError = unknown>(
  macAddress: string,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof currentDeviceSettings>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getCurrentDeviceSettingsQueryOptions(macAddress, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const updateDeviceSettings = (macAddress: string, deviceSettingsRequestDto: DeviceSettingsRequestDto) => {
  return customAxiosInstance<DeviceSettingsResponseDto>({
    url: `/api/devices/${macAddress}/settings`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    data: deviceSettingsRequestDto,
  })
}

export const getUpdateDeviceSettingsMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateDeviceSettings>>,
    TError,
    { macAddress: string; data: DeviceSettingsRequestDto },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof updateDeviceSettings>>,
  TError,
  { macAddress: string; data: DeviceSettingsRequestDto },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateDeviceSettings>>,
    { macAddress: string; data: DeviceSettingsRequestDto }
  > = (props) => {
    const { macAddress, data } = props ?? {}

    return updateDeviceSettings(macAddress, data)
  }

  return { mutationFn, ...mutationOptions }
}

export type UpdateDeviceSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateDeviceSettings>>>
export type UpdateDeviceSettingsMutationBody = DeviceSettingsRequestDto
export type UpdateDeviceSettingsMutationError = unknown

export const useUpdateDeviceSettings = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateDeviceSettings>>,
    TError,
    { macAddress: string; data: DeviceSettingsRequestDto },
    TContext
  >
}): UseMutationResult<
  Awaited<ReturnType<typeof updateDeviceSettings>>,
  TError,
  { macAddress: string; data: DeviceSettingsRequestDto },
  TContext
> => {
  const mutationOptions = getUpdateDeviceSettingsMutationOptions(options)

  return useMutation(mutationOptions)
}

export const updateLocation = (locationUpdateRequestDto: LocationUpdateRequestDto) => {
  return customAxiosInstance<void>({
    url: `/api/location`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: locationUpdateRequestDto,
  })
}

export const getUpdateLocationMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateLocation>>,
    TError,
    { data: LocationUpdateRequestDto },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof updateLocation>>,
  TError,
  { data: LocationUpdateRequestDto },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateLocation>>, { data: LocationUpdateRequestDto }> = (
    props,
  ) => {
    const { data } = props ?? {}

    return updateLocation(data)
  }

  return { mutationFn, ...mutationOptions }
}

export type UpdateLocationMutationResult = NonNullable<Awaited<ReturnType<typeof updateLocation>>>
export type UpdateLocationMutationBody = LocationUpdateRequestDto
export type UpdateLocationMutationError = unknown

export const useUpdateLocation = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateLocation>>,
    TError,
    { data: LocationUpdateRequestDto },
    TContext
  >
}): UseMutationResult<
  Awaited<ReturnType<typeof updateLocation>>,
  TError,
  { data: LocationUpdateRequestDto },
  TContext
> => {
  const mutationOptions = getUpdateLocationMutationOptions(options)

  return useMutation(mutationOptions)
}

export const currentLocation = (signal?: AbortSignal) => {
  return customAxiosInstance<LocationResponseDto>({ url: `/api/location`, method: 'GET', signal })
}

export const getCurrentLocationQueryKey = () => {
  return [`/api/location`] as const
}

export const getCurrentLocationQueryOptions = <
  TData = Awaited<ReturnType<typeof currentLocation>>,
  TError = unknown,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof currentLocation>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getCurrentLocationQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof currentLocation>>> = ({ signal }) => currentLocation(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof currentLocation>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type CurrentLocationQueryResult = NonNullable<Awaited<ReturnType<typeof currentLocation>>>
export type CurrentLocationQueryError = unknown

export const useCurrentLocation = <TData = Awaited<ReturnType<typeof currentLocation>>, TError = unknown>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof currentLocation>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getCurrentLocationQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const getLocationData = (signal?: AbortSignal) => {
  return customAxiosInstance<LocationDataResponseDto>({ url: `/api/location/location-data`, method: 'GET', signal })
}

export const getGetLocationDataQueryKey = () => {
  return [`/api/location/location-data`] as const
}

export const getGetLocationDataQueryOptions = <
  TData = Awaited<ReturnType<typeof getLocationData>>,
  TError = unknown,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getLocationData>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetLocationDataQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getLocationData>>> = ({ signal }) => getLocationData(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getLocationData>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetLocationDataQueryResult = NonNullable<Awaited<ReturnType<typeof getLocationData>>>
export type GetLocationDataQueryError = unknown

export const useGetLocationData = <TData = Awaited<ReturnType<typeof getLocationData>>, TError = unknown>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getLocationData>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetLocationDataQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

/**
 * @summary Trigger a predefined command via apple shortcuts.
 */
export const triggerAppleShortcutsCommand = (hash: string) => {
  return customAxiosInstance<void>({ url: `/api/public/apple-shortcuts/${hash}`, method: 'POST' })
}

export const getTriggerAppleShortcutsCommandMutationOptions = <TError = void, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof triggerAppleShortcutsCommand>>,
    TError,
    { hash: string },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof triggerAppleShortcutsCommand>>,
  TError,
  { hash: string },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof triggerAppleShortcutsCommand>>, { hash: string }> = (
    props,
  ) => {
    const { hash } = props ?? {}

    return triggerAppleShortcutsCommand(hash)
  }

  return { mutationFn, ...mutationOptions }
}

export type TriggerAppleShortcutsCommandMutationResult = NonNullable<
  Awaited<ReturnType<typeof triggerAppleShortcutsCommand>>
>

export type TriggerAppleShortcutsCommandMutationError = void

/**
 * @summary Trigger a predefined command via apple shortcuts.
 */
export const useTriggerAppleShortcutsCommand = <TError = void, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof triggerAppleShortcutsCommand>>,
    TError,
    { hash: string },
    TContext
  >
}): UseMutationResult<Awaited<ReturnType<typeof triggerAppleShortcutsCommand>>, TError, { hash: string }, TContext> => {
  const mutationOptions = getTriggerAppleShortcutsCommandMutationOptions(options)

  return useMutation(mutationOptions)
}

/**
 * @summary Toggles devices on and off.
 */
export const toggleDevicePowerState = (macAddress: string, signal?: AbortSignal) => {
  return customAxiosInstance<void>({ url: `/api/public/stream-deck/toggle/${macAddress}`, method: 'GET', signal })
}

export const getToggleDevicePowerStateQueryKey = (macAddress: string) => {
  return [`/api/public/stream-deck/toggle/${macAddress}`] as const
}

export const getToggleDevicePowerStateQueryOptions = <
  TData = Awaited<ReturnType<typeof toggleDevicePowerState>>,
  TError = unknown,
>(
  macAddress: string,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof toggleDevicePowerState>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getToggleDevicePowerStateQueryKey(macAddress)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof toggleDevicePowerState>>> = ({ signal }) =>
    toggleDevicePowerState(macAddress, signal)

  return { queryKey, queryFn, enabled: !!macAddress, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof toggleDevicePowerState>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type ToggleDevicePowerStateQueryResult = NonNullable<Awaited<ReturnType<typeof toggleDevicePowerState>>>
export type ToggleDevicePowerStateQueryError = unknown

/**
 * @summary Toggles devices on and off.
 */
export const useToggleDevicePowerState = <TData = Awaited<ReturnType<typeof toggleDevicePowerState>>, TError = unknown>(
  macAddress: string,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof toggleDevicePowerState>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getToggleDevicePowerStateQueryOptions(macAddress, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const createCommand = (commandRequestDto: CommandRequestDto) => {
  return customAxiosInstance<void>({
    url: `/api/commands`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: commandRequestDto,
  })
}

export const getCreateCommandMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createCommand>>,
    TError,
    { data: CommandRequestDto },
    TContext
  >
}): UseMutationOptions<Awaited<ReturnType<typeof createCommand>>, TError, { data: CommandRequestDto }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof createCommand>>, { data: CommandRequestDto }> = (
    props,
  ) => {
    const { data } = props ?? {}

    return createCommand(data)
  }

  return { mutationFn, ...mutationOptions }
}

export type CreateCommandMutationResult = NonNullable<Awaited<ReturnType<typeof createCommand>>>
export type CreateCommandMutationBody = CommandRequestDto
export type CreateCommandMutationError = unknown

export const useCreateCommand = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createCommand>>,
    TError,
    { data: CommandRequestDto },
    TContext
  >
}): UseMutationResult<Awaited<ReturnType<typeof createCommand>>, TError, { data: CommandRequestDto }, TContext> => {
  const mutationOptions = getCreateCommandMutationOptions(options)

  return useMutation(mutationOptions)
}

export const getCommands = (signal?: AbortSignal) => {
  return customAxiosInstance<CommandsListResponseDto>({ url: `/api/commands`, method: 'GET', signal })
}

export const getGetCommandsQueryKey = () => {
  return [`/api/commands`] as const
}

export const getGetCommandsQueryOptions = <
  TData = Awaited<ReturnType<typeof getCommands>>,
  TError = unknown,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getCommands>>, TError, TData>>
}) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetCommandsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getCommands>>> = ({ signal }) => getCommands(signal)

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getCommands>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetCommandsQueryResult = NonNullable<Awaited<ReturnType<typeof getCommands>>>
export type GetCommandsQueryError = unknown

export const useGetCommands = <TData = Awaited<ReturnType<typeof getCommands>>, TError = unknown>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getCommands>>, TError, TData>>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetCommandsQueryOptions(options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const getCommand = (commandId: number, signal?: AbortSignal) => {
  return customAxiosInstance<CommandResponseDto>({ url: `/api/commands/${commandId}`, method: 'GET', signal })
}

export const getGetCommandQueryKey = (commandId: number) => {
  return [`/api/commands/${commandId}`] as const
}

export const getGetCommandQueryOptions = <TData = Awaited<ReturnType<typeof getCommand>>, TError = unknown>(
  commandId: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getCommand>>, TError, TData>> },
) => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetCommandQueryKey(commandId)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getCommand>>> = ({ signal }) => getCommand(commandId, signal)

  return { queryKey, queryFn, enabled: !!commandId, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getCommand>>,
    TError,
    TData
  > & { queryKey: QueryKey }
}

export type GetCommandQueryResult = NonNullable<Awaited<ReturnType<typeof getCommand>>>
export type GetCommandQueryError = unknown

export const useGetCommand = <TData = Awaited<ReturnType<typeof getCommand>>, TError = unknown>(
  commandId: number,
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getCommand>>, TError, TData>> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetCommandQueryOptions(commandId, options)

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryOptions.queryKey

  return query
}

export const updateCommand = (commandId: number, commandRequestDto: CommandRequestDto) => {
  return customAxiosInstance<void>({
    url: `/api/commands/${commandId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: commandRequestDto,
  })
}

export const getUpdateCommandMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateCommand>>,
    TError,
    { commandId: number; data: CommandRequestDto },
    TContext
  >
}): UseMutationOptions<
  Awaited<ReturnType<typeof updateCommand>>,
  TError,
  { commandId: number; data: CommandRequestDto },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateCommand>>,
    { commandId: number; data: CommandRequestDto }
  > = (props) => {
    const { commandId, data } = props ?? {}

    return updateCommand(commandId, data)
  }

  return { mutationFn, ...mutationOptions }
}

export type UpdateCommandMutationResult = NonNullable<Awaited<ReturnType<typeof updateCommand>>>
export type UpdateCommandMutationBody = CommandRequestDto
export type UpdateCommandMutationError = unknown

export const useUpdateCommand = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateCommand>>,
    TError,
    { commandId: number; data: CommandRequestDto },
    TContext
  >
}): UseMutationResult<
  Awaited<ReturnType<typeof updateCommand>>,
  TError,
  { commandId: number; data: CommandRequestDto },
  TContext
> => {
  const mutationOptions = getUpdateCommandMutationOptions(options)

  return useMutation(mutationOptions)
}

export const deleteCommand = (commandId: number) => {
  return customAxiosInstance<void>({ url: `/api/commands/${commandId}`, method: 'DELETE' })
}

export const getDeleteCommandMutationOptions = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCommand>>, TError, { commandId: number }, TContext>
}): UseMutationOptions<Awaited<ReturnType<typeof deleteCommand>>, TError, { commandId: number }, TContext> => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteCommand>>, { commandId: number }> = (props) => {
    const { commandId } = props ?? {}

    return deleteCommand(commandId)
  }

  return { mutationFn, ...mutationOptions }
}

export type DeleteCommandMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCommand>>>

export type DeleteCommandMutationError = unknown

export const useDeleteCommand = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCommand>>, TError, { commandId: number }, TContext>
}): UseMutationResult<Awaited<ReturnType<typeof deleteCommand>>, TError, { commandId: number }, TContext> => {
  const mutationOptions = getDeleteCommandMutationOptions(options)

  return useMutation(mutationOptions)
}
