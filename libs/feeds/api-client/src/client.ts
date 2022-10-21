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

export type FeedControllerGetParams = { cursor?: number }

export type FeedControllerDiscoverParams = { url: string }

export type ArticleControllerSearchParams = { s: string; cursor?: number }

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

export const articleControllerToggleUnread = (id: string, articleToggleUnreadDto: ArticleToggleUnreadDto) => {
  return customAxiosInstance<ArticleResponseDto>({
    url: `/api/article/${id}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: articleToggleUnreadDto,
  })
}

export type ArticleControllerToggleUnreadMutationResult = NonNullable<
  Awaited<ReturnType<typeof articleControllerToggleUnread>>
>
export type ArticleControllerToggleUnreadMutationBody = ArticleToggleUnreadDto
export type ArticleControllerToggleUnreadMutationError = unknown

export const useArticleControllerToggleUnread = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof articleControllerToggleUnread>>,
    TError,
    { id: string; data: ArticleToggleUnreadDto },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof articleControllerToggleUnread>>,
    { id: string; data: ArticleToggleUnreadDto }
  > = (props) => {
    const { id, data } = props ?? {}

    return articleControllerToggleUnread(id, data)
  }

  return useMutation<
    Awaited<ReturnType<typeof articleControllerToggleUnread>>,
    TError,
    { id: string; data: ArticleToggleUnreadDto },
    TContext
  >(mutationFn, mutationOptions)
}

export const articleControllerSearch = (params: ArticleControllerSearchParams, signal?: AbortSignal) => {
  return customAxiosInstance<PaginatedArticlesDto>({ url: `/api/article/search`, method: 'get', params, signal })
}

export const getArticleControllerSearchQueryKey = (params: ArticleControllerSearchParams) => [
  `/api/article/search`,
  ...(params ? [params] : []),
]

export type ArticleControllerSearchInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof articleControllerSearch>>
>
export type ArticleControllerSearchInfiniteQueryError = unknown

export const useArticleControllerSearchInfinite = <
  TData = Awaited<ReturnType<typeof articleControllerSearch>>,
  TError = unknown,
>(
  params: ArticleControllerSearchParams,
  options?: { query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof articleControllerSearch>>, TError, TData> },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getArticleControllerSearchQueryKey(params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof articleControllerSearch>>> = ({ signal, pageParam }) =>
    articleControllerSearch({ cursor: pageParam, ...params }, signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof articleControllerSearch>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type ArticleControllerSearchQueryResult = NonNullable<Awaited<ReturnType<typeof articleControllerSearch>>>
export type ArticleControllerSearchQueryError = unknown

export const useArticleControllerSearch = <
  TData = Awaited<ReturnType<typeof articleControllerSearch>>,
  TError = unknown,
>(
  params: ArticleControllerSearchParams,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof articleControllerSearch>>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getArticleControllerSearchQueryKey(params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof articleControllerSearch>>> = ({ signal }) =>
    articleControllerSearch(params, signal)

  const query = useQuery<Awaited<ReturnType<typeof articleControllerSearch>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const authenticationControllerLogin = (userLoginDto: UserLoginDto) => {
  return customAxiosInstance<LoginResponseDto>({
    url: `/api/authentication/login`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: userLoginDto,
  })
}

export type AuthenticationControllerLoginMutationResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerLogin>>
>
export type AuthenticationControllerLoginMutationBody = UserLoginDto
export type AuthenticationControllerLoginMutationError = unknown

export const useAuthenticationControllerLogin = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof authenticationControllerLogin>>,
    TError,
    { data: UserLoginDto },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof authenticationControllerLogin>>,
    { data: UserLoginDto }
  > = (props) => {
    const { data } = props ?? {}

    return authenticationControllerLogin(data)
  }

  return useMutation<
    Awaited<ReturnType<typeof authenticationControllerLogin>>,
    TError,
    { data: UserLoginDto },
    TContext
  >(mutationFn, mutationOptions)
}

export const authenticationControllerLogout = (signal?: AbortSignal) => {
  return customAxiosInstance<void>({ url: `/api/authentication/logout`, method: 'get', signal })
}

export const getAuthenticationControllerLogoutQueryKey = () => [`/api/authentication/logout`]

export type AuthenticationControllerLogoutInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerLogout>>
>
export type AuthenticationControllerLogoutInfiniteQueryError = unknown

export const useAuthenticationControllerLogoutInfinite = <
  TData = Awaited<ReturnType<typeof authenticationControllerLogout>>,
  TError = unknown,
>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof authenticationControllerLogout>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getAuthenticationControllerLogoutQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof authenticationControllerLogout>>> = ({ signal }) =>
    authenticationControllerLogout(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof authenticationControllerLogout>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type AuthenticationControllerLogoutQueryResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerLogout>>
>
export type AuthenticationControllerLogoutQueryError = unknown

export const useAuthenticationControllerLogout = <
  TData = Awaited<ReturnType<typeof authenticationControllerLogout>>,
  TError = unknown,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof authenticationControllerLogout>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getAuthenticationControllerLogoutQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof authenticationControllerLogout>>> = ({ signal }) =>
    authenticationControllerLogout(signal)

  const query = useQuery<Awaited<ReturnType<typeof authenticationControllerLogout>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const authenticationControllerRegister = (userRegistrationDto: UserRegistrationDto) => {
  return customAxiosInstance<UserResponseDto>({
    url: `/api/authentication/register`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: userRegistrationDto,
  })
}

export type AuthenticationControllerRegisterMutationResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerRegister>>
>
export type AuthenticationControllerRegisterMutationBody = UserRegistrationDto
export type AuthenticationControllerRegisterMutationError = unknown

export const useAuthenticationControllerRegister = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof authenticationControllerRegister>>,
    TError,
    { data: UserRegistrationDto },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof authenticationControllerRegister>>,
    { data: UserRegistrationDto }
  > = (props) => {
    const { data } = props ?? {}

    return authenticationControllerRegister(data)
  }

  return useMutation<
    Awaited<ReturnType<typeof authenticationControllerRegister>>,
    TError,
    { data: UserRegistrationDto },
    TContext
  >(mutationFn, mutationOptions)
}

export const authenticationControllerGetProfile = (signal?: AbortSignal) => {
  return customAxiosInstance<UserResponseDto>({ url: `/api/authentication/profile`, method: 'get', signal })
}

export const getAuthenticationControllerGetProfileQueryKey = () => [`/api/authentication/profile`]

export type AuthenticationControllerGetProfileInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerGetProfile>>
>
export type AuthenticationControllerGetProfileInfiniteQueryError = unknown

export const useAuthenticationControllerGetProfileInfinite = <
  TData = Awaited<ReturnType<typeof authenticationControllerGetProfile>>,
  TError = unknown,
>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof authenticationControllerGetProfile>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getAuthenticationControllerGetProfileQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof authenticationControllerGetProfile>>> = ({ signal }) =>
    authenticationControllerGetProfile(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof authenticationControllerGetProfile>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type AuthenticationControllerGetProfileQueryResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerGetProfile>>
>
export type AuthenticationControllerGetProfileQueryError = unknown

export const useAuthenticationControllerGetProfile = <
  TData = Awaited<ReturnType<typeof authenticationControllerGetProfile>>,
  TError = unknown,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof authenticationControllerGetProfile>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getAuthenticationControllerGetProfileQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof authenticationControllerGetProfile>>> = ({ signal }) =>
    authenticationControllerGetProfile(signal)

  const query = useQuery<Awaited<ReturnType<typeof authenticationControllerGetProfile>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const authenticationControllerRefresh = (signal?: AbortSignal) => {
  return customAxiosInstance<LoginResponseDto>({ url: `/api/authentication/refresh`, method: 'get', signal })
}

export const getAuthenticationControllerRefreshQueryKey = () => [`/api/authentication/refresh`]

export type AuthenticationControllerRefreshInfiniteQueryResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerRefresh>>
>
export type AuthenticationControllerRefreshInfiniteQueryError = unknown

export const useAuthenticationControllerRefreshInfinite = <
  TData = Awaited<ReturnType<typeof authenticationControllerRefresh>>,
  TError = unknown,
>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof authenticationControllerRefresh>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getAuthenticationControllerRefreshQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof authenticationControllerRefresh>>> = ({ signal }) =>
    authenticationControllerRefresh(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof authenticationControllerRefresh>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type AuthenticationControllerRefreshQueryResult = NonNullable<
  Awaited<ReturnType<typeof authenticationControllerRefresh>>
>
export type AuthenticationControllerRefreshQueryError = unknown

export const useAuthenticationControllerRefresh = <
  TData = Awaited<ReturnType<typeof authenticationControllerRefresh>>,
  TError = unknown,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof authenticationControllerRefresh>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getAuthenticationControllerRefreshQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof authenticationControllerRefresh>>> = ({ signal }) =>
    authenticationControllerRefresh(signal)

  const query = useQuery<Awaited<ReturnType<typeof authenticationControllerRefresh>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const feedControllerDiscover = (params: FeedControllerDiscoverParams) => {
  return customAxiosInstance<DiscoverResponseDto>({ url: `/api/feed/discover`, method: 'post', params })
}

export type FeedControllerDiscoverMutationResult = NonNullable<Awaited<ReturnType<typeof feedControllerDiscover>>>

export type FeedControllerDiscoverMutationError = unknown

export const useFeedControllerDiscover = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof feedControllerDiscover>>,
    TError,
    { params: FeedControllerDiscoverParams },
    TContext
  >
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof feedControllerDiscover>>,
    { params: FeedControllerDiscoverParams }
  > = (props) => {
    const { params } = props ?? {}

    return feedControllerDiscover(params)
  }

  return useMutation<
    Awaited<ReturnType<typeof feedControllerDiscover>>,
    TError,
    { params: FeedControllerDiscoverParams },
    TContext
  >(mutationFn, mutationOptions)
}

export const feedControllerAdd = (feedInputDto: FeedInputDto) => {
  return customAxiosInstance<FeedResponseDto>({
    url: `/api/feed`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: feedInputDto,
  })
}

export type FeedControllerAddMutationResult = NonNullable<Awaited<ReturnType<typeof feedControllerAdd>>>
export type FeedControllerAddMutationBody = FeedInputDto
export type FeedControllerAddMutationError = unknown

export const useFeedControllerAdd = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof feedControllerAdd>>, TError, { data: FeedInputDto }, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof feedControllerAdd>>, { data: FeedInputDto }> = (
    props,
  ) => {
    const { data } = props ?? {}

    return feedControllerAdd(data)
  }

  return useMutation<Awaited<ReturnType<typeof feedControllerAdd>>, TError, { data: FeedInputDto }, TContext>(
    mutationFn,
    mutationOptions,
  )
}

export const feedControllerGetAll = (signal?: AbortSignal) => {
  return customAxiosInstance<FeedResponseDto[]>({ url: `/api/feed`, method: 'get', signal })
}

export const getFeedControllerGetAllQueryKey = () => [`/api/feed`]

export type FeedControllerGetAllInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof feedControllerGetAll>>>
export type FeedControllerGetAllInfiniteQueryError = unknown

export const useFeedControllerGetAllInfinite = <
  TData = Awaited<ReturnType<typeof feedControllerGetAll>>,
  TError = unknown,
>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof feedControllerGetAll>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getFeedControllerGetAllQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof feedControllerGetAll>>> = ({ signal }) =>
    feedControllerGetAll(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof feedControllerGetAll>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type FeedControllerGetAllQueryResult = NonNullable<Awaited<ReturnType<typeof feedControllerGetAll>>>
export type FeedControllerGetAllQueryError = unknown

export const useFeedControllerGetAll = <
  TData = Awaited<ReturnType<typeof feedControllerGetAll>>,
  TError = unknown,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof feedControllerGetAll>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getFeedControllerGetAllQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof feedControllerGetAll>>> = ({ signal }) =>
    feedControllerGetAll(signal)

  const query = useQuery<Awaited<ReturnType<typeof feedControllerGetAll>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const feedControllerGet = (feedId: unknown, params?: FeedControllerGetParams, signal?: AbortSignal) => {
  return customAxiosInstance<PaginatedArticlesDto>({ url: `/api/feed/${feedId}`, method: 'get', params, signal })
}

export const getFeedControllerGetQueryKey = (feedId: unknown, params?: FeedControllerGetParams) => [
  `/api/feed/${feedId}`,
  ...(params ? [params] : []),
]

export type FeedControllerGetInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof feedControllerGet>>>
export type FeedControllerGetInfiniteQueryError = unknown

export const useFeedControllerGetInfinite = <TData = Awaited<ReturnType<typeof feedControllerGet>>, TError = unknown>(
  feedId: unknown,
  params?: FeedControllerGetParams,
  options?: { query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof feedControllerGet>>, TError, TData> },
): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getFeedControllerGetQueryKey(feedId, params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof feedControllerGet>>> = ({ signal, pageParam }) =>
    feedControllerGet(feedId, { cursor: pageParam, ...params }, signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof feedControllerGet>>, TError, TData>(queryKey, queryFn, {
    enabled: !!feedId,
    ...queryOptions,
  }) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type FeedControllerGetQueryResult = NonNullable<Awaited<ReturnType<typeof feedControllerGet>>>
export type FeedControllerGetQueryError = unknown

export const useFeedControllerGet = <TData = Awaited<ReturnType<typeof feedControllerGet>>, TError = unknown>(
  feedId: unknown,
  params?: FeedControllerGetParams,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof feedControllerGet>>, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getFeedControllerGetQueryKey(feedId, params)

  const queryFn: QueryFunction<Awaited<ReturnType<typeof feedControllerGet>>> = ({ signal }) =>
    feedControllerGet(feedId, params, signal)

  const query = useQuery<Awaited<ReturnType<typeof feedControllerGet>>, TError, TData>(queryKey, queryFn, {
    enabled: !!feedId,
    ...queryOptions,
  }) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
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

export const userControllerGetAll = (signal?: AbortSignal) => {
  return customAxiosInstance<UserResponseDto[]>({ url: `/api/user`, method: 'get', signal })
}

export const getUserControllerGetAllQueryKey = () => [`/api/user`]

export type UserControllerGetAllInfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof userControllerGetAll>>>
export type UserControllerGetAllInfiniteQueryError = unknown

export const useUserControllerGetAllInfinite = <
  TData = Awaited<ReturnType<typeof userControllerGetAll>>,
  TError = unknown,
>(options?: {
  query?: UseInfiniteQueryOptions<Awaited<ReturnType<typeof userControllerGetAll>>, TError, TData>
}): UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getUserControllerGetAllQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof userControllerGetAll>>> = ({ signal }) =>
    userControllerGetAll(signal)

  const query = useInfiniteQuery<Awaited<ReturnType<typeof userControllerGetAll>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseInfiniteQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export type UserControllerGetAllQueryResult = NonNullable<Awaited<ReturnType<typeof userControllerGetAll>>>
export type UserControllerGetAllQueryError = unknown

export const useUserControllerGetAll = <
  TData = Awaited<ReturnType<typeof userControllerGetAll>>,
  TError = unknown,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof userControllerGetAll>>, TError, TData>
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}

  const queryKey = queryOptions?.queryKey ?? getUserControllerGetAllQueryKey()

  const queryFn: QueryFunction<Awaited<ReturnType<typeof userControllerGetAll>>> = ({ signal }) =>
    userControllerGetAll(signal)

  const query = useQuery<Awaited<ReturnType<typeof userControllerGetAll>>, TError, TData>(
    queryKey,
    queryFn,
    queryOptions,
  ) as UseQueryResult<TData, TError> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

export const schedulingControllerFetchNow = () => {
  return customAxiosInstance<void>({ url: `/api/scheduling/now`, method: 'post' })
}

export type SchedulingControllerFetchNowMutationResult = NonNullable<
  Awaited<ReturnType<typeof schedulingControllerFetchNow>>
>

export type SchedulingControllerFetchNowMutationError = unknown

export const useSchedulingControllerFetchNow = <TError = unknown, TVariables = void, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof schedulingControllerFetchNow>>, TError, TVariables, TContext>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof schedulingControllerFetchNow>>, TVariables> = () => {
    return schedulingControllerFetchNow()
  }

  return useMutation<Awaited<ReturnType<typeof schedulingControllerFetchNow>>, TError, TVariables, TContext>(
    mutationFn,
    mutationOptions,
  )
}
