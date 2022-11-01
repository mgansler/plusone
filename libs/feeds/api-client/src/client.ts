/**
 * Generated by orval v6.10.2 🍺
 * Do not edit manually.
 * Feeds API
 * OpenAPI spec version: 0.1
 */
import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query'
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  QueryFunction,
  MutationFunction,
  UseQueryResult,
  UseInfiniteQueryResult,
  QueryKey,
} from '@tanstack/react-query'
import { customAxiosInstance } from './custom-axios'
export type HealthControllerGetHealthStatus503Details = {
  [key: string]: {
    status?: string
    [key: string]: string
  }
}

export type HealthControllerGetHealthStatus503Error = {
  [key: string]: {
    status?: string
    [key: string]: string
  }
} | null

export type HealthControllerGetHealthStatus503Info = {
  [key: string]: {
    status?: string
    [key: string]: string
  }
} | null

export type HealthControllerGetHealthStatus503 = {
  status?: string
  info?: HealthControllerGetHealthStatus503Info
  error?: HealthControllerGetHealthStatus503Error
  details?: HealthControllerGetHealthStatus503Details
}

export type HealthControllerGetHealthStatus200Details = {
  [key: string]: {
    status?: string
    [key: string]: string
  }
}

export type HealthControllerGetHealthStatus200Error = {
  [key: string]: {
    status?: string
    [key: string]: string
  }
} | null

export type HealthControllerGetHealthStatus200Info = {
  [key: string]: {
    status?: string
    [key: string]: string
  }
} | null

export type HealthControllerGetHealthStatus200 = {
  status?: string
  info?: HealthControllerGetHealthStatus200Info
  error?: HealthControllerGetHealthStatus200Error
  details?: HealthControllerGetHealthStatus200Details
}

export type DiscoverFeedParams = { url: string }

export type FindArticlesParams = { s?: string; r?: boolean; sort?: Sort; f?: string; cursor?: number }

export interface UpdateFeedSettingsInputDto {
  expandContent: boolean
  includeRead: boolean
  order: Sort
}

export interface UserFeedResponseDto {
  feedUrl: string
  id: string
  originalTitle: string
  title?: string
  includeRead: boolean
  order: Sort
  expandContent: boolean
  unreadCount: number
}

export interface FeedResponseDto {
  feedUrl: string
  id: string
  originalTitle: string
  title?: string
}

export interface FeedInputDto {
  url: string
  title: string
  feedUrl: string
}

export interface DiscoverResponseDto {
  feedUrl: string
  title: string
  url: string
}

export interface UserResponseDto {
  email?: string
  id: string
  isAdmin: boolean
  username: string
}

export interface UserRegistrationDto {
  username: string
  password: string
}

export interface LoginResponseDto {
  access_token: string
  refresh_token: string
}

export interface UserLoginDto {
  username: string
  password: string
}

export type Sort = typeof Sort[keyof typeof Sort]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sort = {
  desc: 'desc',
  asc: 'asc',
} as const

export interface ArticleDto {
  id: string
  title: string
  content: string
  contentBody: string
  guid: string
  link: string
}

export interface ArticleResponseDto {
  article: ArticleDto
  cursor: number
  unread: boolean
}

export interface PaginatedArticlesDto {
  content: ArticleResponseDto[]
  pageSize: number
  totalCount: number
  unreadCount: number
  lastCursor?: number
}

export interface ArticleToggleUnreadDto {
  unread: boolean
}

export const toggleUnread = (id: string, articleToggleUnreadDto: ArticleToggleUnreadDto) => {
  return customAxiosInstance<ArticleResponseDto>({
    url: `/api/article/${id}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: articleToggleUnreadDto,
  })
}

export type ToggleUnreadMutationResult = NonNullable<Awaited<ReturnType<typeof toggleUnread>>>
export type ToggleUnreadMutationBody = ArticleToggleUnreadDto
export type ToggleUnreadMutationError = unknown

export const useToggleUnread = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof toggleUnread>>,
    TError,
    { id: string; data: ArticleToggleUnreadDto },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof toggleUnread>>,
    { id: string; data: ArticleToggleUnreadDto }
  > = (props) => {
    const { id, data } = props ?? {}

    return toggleUnread(id, data)
  }

  return useMutation<
    Awaited<ReturnType<typeof toggleUnread>>,
    TError,
    { id: string; data: ArticleToggleUnreadDto },
    TContext
  >(mutationFn, mutationOptions)
}

export const findArticles = (params?: FindArticlesParams, signal?: AbortSignal) => {
  return customAxiosInstance<PaginatedArticlesDto>({ url: `/api/article/find`, method: 'get', params, signal })
}

export const getFindArticlesQueryKey = (params?: FindArticlesParams) => [
  `/api/article/find`,
  ...(params ? [params] : []),
]

export type FindArticlesInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof findArticles>>>
export type FindArticlesInfiniteQueryError = unknown

export const useFindArticlesInfinite = <TData = Awaited<ReturnType<typeof findArticles>>, TError = unknown>(
  params?: FindArticlesParams,
  options?: { query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof findArticles>>, TError, TData> },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getFindArticlesQueryKey(params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof findArticles>>> = ({ signal, pageParam }) =>
    findArticles({ cursor: pageParam, ...params }, signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof findArticles>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type FindArticlesQueryResult = NonNullable<Awaited<ReturnType<typeof findArticles>>>
export type FindArticlesQueryError = unknown

export const useFindArticles = <TData = Awaited<ReturnType<typeof findArticles>>, TError = unknown>(
  params?: FindArticlesParams,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof findArticles>>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getFindArticlesQueryKey(params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof findArticles>>> = ({ signal }) => findArticles(params, signal)

  const query = useQuery<Awaited<ReturnType<typeof findArticles>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const login = (userLoginDto: UserLoginDto) => {
  return customAxiosInstance<LoginResponseDto>({
    url: `/api/authentication/login`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: userLoginDto,
  })
}

export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>
export type LoginMutationBody = UserLoginDto
export type LoginMutationError = unknown

export const useLogin = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, { data: UserLoginDto }, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof login>>, { data: UserLoginDto }> = (props) => {
    const { data } = props ?? {}

    return login(data)
  }

  return useMutation<Awaited<ReturnType<typeof login>>, TError, { data: UserLoginDto }, TContext>(
    mutationFn,
    mutationOptions,
  )
}

export const logout = (signal?: AbortSignal) => {
  return customAxiosInstance<void>({ url: `/api/authentication/logout`, method: 'get', signal })
}

export const getLogoutQueryKey = () => [`/api/authentication/logout`]

export type LogoutInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof logout>>>
export type LogoutInfiniteQueryError = unknown

export const useLogoutInfinite = <TData = Awaited<ReturnType<typeof logout>>, TError = unknown>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof logout>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getLogoutQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof logout>>> = ({ signal }) => logout(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof logout>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type LogoutQueryResult = NonNullable<Awaited<ReturnType<typeof logout>>>
export type LogoutQueryError = unknown

export const useLogout = <TData = Awaited<ReturnType<typeof logout>>, TError = unknown>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof logout>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getLogoutQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof logout>>> = ({ signal }) => logout(signal)

  const query = useQuery<Awaited<ReturnType<typeof logout>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const register = (userRegistrationDto: UserRegistrationDto) => {
  return customAxiosInstance<UserResponseDto>({
    url: `/api/authentication/register`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: userRegistrationDto,
  })
}

export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>
export type RegisterMutationBody = UserRegistrationDto
export type RegisterMutationError = unknown

export const useRegister = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, { data: UserRegistrationDto }, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof register>>, { data: UserRegistrationDto }> = (props) => {
    const { data } = props ?? {}

    return register(data)
  }

  return useMutation<Awaited<ReturnType<typeof register>>, TError, { data: UserRegistrationDto }, TContext>(
    mutationFn,
    mutationOptions,
  )
}

export const profile = (signal?: AbortSignal) => {
  return customAxiosInstance<UserResponseDto>({ url: `/api/authentication/profile`, method: 'get', signal })
}

export const getProfileQueryKey = () => [`/api/authentication/profile`]

export type ProfileInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof profile>>>
export type ProfileInfiniteQueryError = unknown

export const useProfileInfinite = <TData = Awaited<ReturnType<typeof profile>>, TError = unknown>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof profile>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getProfileQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof profile>>> = ({ signal }) => profile(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof profile>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type ProfileQueryResult = NonNullable<Awaited<ReturnType<typeof profile>>>
export type ProfileQueryError = unknown

export const useProfile = <TData = Awaited<ReturnType<typeof profile>>, TError = unknown>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof profile>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getProfileQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof profile>>> = ({ signal }) => profile(signal)

  const query = useQuery<Awaited<ReturnType<typeof profile>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const refresh = (signal?: AbortSignal) => {
  return customAxiosInstance<LoginResponseDto>({ url: `/api/authentication/refresh`, method: 'get', signal })
}

export const getRefreshQueryKey = () => [`/api/authentication/refresh`]

export type RefreshInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof refresh>>>
export type RefreshInfiniteQueryError = unknown

export const useRefreshInfinite = <TData = Awaited<ReturnType<typeof refresh>>, TError = unknown>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof refresh>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getRefreshQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof refresh>>> = ({ signal }) => refresh(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof refresh>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type RefreshQueryResult = NonNullable<Awaited<ReturnType<typeof refresh>>>
export type RefreshQueryError = unknown

export const useRefresh = <TData = Awaited<ReturnType<typeof refresh>>, TError = unknown>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof refresh>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getRefreshQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof refresh>>> = ({ signal }) => refresh(signal)

  const query = useQuery<Awaited<ReturnType<typeof refresh>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const discoverFeed = (params: DiscoverFeedParams) => {
  return customAxiosInstance<DiscoverResponseDto>({ url: `/api/feed/discover`, method: 'post', params })
}

export type DiscoverFeedMutationResult = NonNullable<Awaited<ReturnType<typeof discoverFeed>>>

export type DiscoverFeedMutationError = unknown

export const useDiscoverFeed = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof discoverFeed>>,
    TError,
    { params: DiscoverFeedParams },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof discoverFeed>>, { params: DiscoverFeedParams }> = (
    props,
  ) => {
    const { params } = props ?? {}

    return discoverFeed(params)
  }

  return useMutation<Awaited<ReturnType<typeof discoverFeed>>, TError, { params: DiscoverFeedParams }, TContext>(
    mutationFn,
    mutationOptions,
  )
}

export const addFeed = (feedInputDto: FeedInputDto) => {
  return customAxiosInstance<FeedResponseDto>({
    url: `/api/feed`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: feedInputDto,
  })
}

export type AddFeedMutationResult = NonNullable<Awaited<ReturnType<typeof addFeed>>>
export type AddFeedMutationBody = FeedInputDto
export type AddFeedMutationError = unknown

export const useAddFeed = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof addFeed>>, TError, { data: FeedInputDto }, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof addFeed>>, { data: FeedInputDto }> = (props) => {
    const { data } = props ?? {}

    return addFeed(data)
  }

  return useMutation<Awaited<ReturnType<typeof addFeed>>, TError, { data: FeedInputDto }, TContext>(
    mutationFn,
    mutationOptions,
  )
}

export const getUserFeeds = (signal?: AbortSignal) => {
  return customAxiosInstance<UserFeedResponseDto[]>({ url: `/api/feed`, method: 'get', signal })
}

export const getGetUserFeedsQueryKey = () => [`/api/feed`]

export type GetUserFeedsInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof getUserFeeds>>>
export type GetUserFeedsInfiniteQueryError = unknown

export const useGetUserFeedsInfinite = <TData = Awaited<ReturnType<typeof getUserFeeds>>, TError = unknown>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof getUserFeeds>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetUserFeedsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUserFeeds>>> = ({ signal }) => getUserFeeds(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof getUserFeeds>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type GetUserFeedsQueryResult = NonNullable<Awaited<ReturnType<typeof getUserFeeds>>>
export type GetUserFeedsQueryError = unknown

export const useGetUserFeeds = <TData = Awaited<ReturnType<typeof getUserFeeds>>, TError = unknown>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getUserFeeds>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetUserFeedsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUserFeeds>>> = ({ signal }) => getUserFeeds(signal)

  const query = useQuery<Awaited<ReturnType<typeof getUserFeeds>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const getFeeds = (signal?: AbortSignal) => {
  return customAxiosInstance<FeedResponseDto[]>({ url: `/api/feed/all`, method: 'get', signal })
}

export const getGetFeedsQueryKey = () => [`/api/feed/all`]

export type GetFeedsInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof getFeeds>>>
export type GetFeedsInfiniteQueryError = unknown

export const useGetFeedsInfinite = <TData = Awaited<ReturnType<typeof getFeeds>>, TError = unknown>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof getFeeds>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetFeedsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getFeeds>>> = ({ signal }) => getFeeds(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof getFeeds>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type GetFeedsQueryResult = NonNullable<Awaited<ReturnType<typeof getFeeds>>>
export type GetFeedsQueryError = unknown

export const useGetFeeds = <TData = Awaited<ReturnType<typeof getFeeds>>, TError = unknown>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getFeeds>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetFeedsQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getFeeds>>> = ({ signal }) => getFeeds(signal)

  const query = useQuery<Awaited<ReturnType<typeof getFeeds>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const updateFeedSettings = (id: string, updateFeedSettingsInputDto: UpdateFeedSettingsInputDto) => {
  return customAxiosInstance<void>({
    url: `/api/feed/${id}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: updateFeedSettingsInputDto,
  })
}

export type UpdateFeedSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateFeedSettings>>>
export type UpdateFeedSettingsMutationBody = UpdateFeedSettingsInputDto
export type UpdateFeedSettingsMutationError = unknown

export const useUpdateFeedSettings = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateFeedSettings>>,
    TError,
    { id: string; data: UpdateFeedSettingsInputDto },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateFeedSettings>>,
    { id: string; data: UpdateFeedSettingsInputDto }
  > = (props) => {
    const { id, data } = props ?? {}

    return updateFeedSettings(id, data)
  }

  return useMutation<
    Awaited<ReturnType<typeof updateFeedSettings>>,
    TError,
    { id: string; data: UpdateFeedSettingsInputDto },
    TContext
  >(mutationFn, mutationOptions)
}

export const healthControllerGetHealthStatus = (signal?: AbortSignal) => {
  return customAxiosInstance<HealthControllerGetHealthStatus200>({ url: `/api/health`, method: 'get', signal })
}

export const getHealthControllerGetHealthStatusQueryKey = () => [`/api/health`]

export type HealthControllerGetHealthStatusInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof healthControllerGetHealthStatus>>
>
export type HealthControllerGetHealthStatusInfiniteQueryError = HealthControllerGetHealthStatus503

export const useHealthControllerGetHealthStatusInfinite = <
  TData = Awaited<ReturnType<typeof healthControllerGetHealthStatus>>,
  TError = HealthControllerGetHealthStatus503,
>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof healthControllerGetHealthStatus>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getHealthControllerGetHealthStatusQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthControllerGetHealthStatus>>> = ({ signal }) =>
    healthControllerGetHealthStatus(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof healthControllerGetHealthStatus>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type HealthControllerGetHealthStatusQueryResult = NonNullable<
  Awaited<ReturnType<typeof healthControllerGetHealthStatus>>
>
export type HealthControllerGetHealthStatusQueryError = HealthControllerGetHealthStatus503

export const useHealthControllerGetHealthStatus = <
  TData = Awaited<ReturnType<typeof healthControllerGetHealthStatus>>,
  TError = HealthControllerGetHealthStatus503,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof healthControllerGetHealthStatus>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getHealthControllerGetHealthStatusQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthControllerGetHealthStatus>>> = ({ signal }) =>
    healthControllerGetHealthStatus(signal)

  const query = useQuery<Awaited<ReturnType<typeof healthControllerGetHealthStatus>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const getUsers = (signal?: AbortSignal) => {
  return customAxiosInstance<UserResponseDto[]>({ url: `/api/user`, method: 'get', signal })
}

export const getGetUsersQueryKey = () => [`/api/user`]

export type GetUsersInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof getUsers>>>
export type GetUsersInfiniteQueryError = unknown

export const useGetUsersInfinite = <TData = Awaited<ReturnType<typeof getUsers>>, TError = unknown>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetUsersQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUsers>>> = ({ signal }) => getUsers(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof getUsers>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type GetUsersQueryResult = NonNullable<Awaited<ReturnType<typeof getUsers>>>
export type GetUsersQueryError = unknown

export const useGetUsers = <TData = Awaited<ReturnType<typeof getUsers>>, TError = unknown>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getGetUsersQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUsers>>> = ({ signal }) => getUsers(signal)

  const query = useQuery<Awaited<ReturnType<typeof getUsers>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const deleteUser = (userId: unknown) => {
  return customAxiosInstance<void>({ url: `/api/user/${userId}`, method: 'delete' })
}

export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>

export type DeleteUserMutationError = unknown

export const useDeleteUser = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, { userId: unknown }, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteUser>>, { userId: unknown }> = (props) => {
    const { userId } = props ?? {}

    return deleteUser(userId)
  }

  return useMutation<Awaited<ReturnType<typeof deleteUser>>, TError, { userId: unknown }, TContext>(
    mutationFn,
    mutationOptions,
  )
}

export const forceFetching = () => {
  return customAxiosInstance<void>({ url: `/api/scheduling/now`, method: 'post' })
}

export type ForceFetchingMutationResult = NonNullable<Awaited<ReturnType<typeof forceFetching>>>

export type ForceFetchingMutationError = unknown

export const useForceFetching = <TError = unknown, TVariables = void, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof forceFetching>>, TError, TVariables, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof forceFetching>>, TVariables> = () => {
    return forceFetching()
  }

  return useMutation<Awaited<ReturnType<typeof forceFetching>>, TError, TVariables, TContext>(
    mutationFn,
    mutationOptions,
  )
}
