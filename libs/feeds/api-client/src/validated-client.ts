import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { z, ZodType } from 'zod'

import { bootInfo, getFeedSettings, useBootInfo, useGetFeedSettings } from './client'
import { bootInfoResponse, getFeedSettingsResponse } from './zod'

type ValidatedUseQueryReturnType<
  OriginalUseQueryReturnType extends { data: unknown },
  ValidationSchema extends ZodType<unknown, unknown, unknown>,
> = Omit<OriginalUseQueryReturnType, 'data'> & {
  data: z.infer<ValidationSchema> | undefined
}

function factory<TSchema extends ZodType<unknown, unknown, unknown>>(
  schema: TSchema,
  fetchWrapper: (signal?: AbortSignal) => Promise<AxiosResponse<object>>,
  useQueryWrapper: (options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof fetchWrapper>>, unknown, Awaited<ReturnType<typeof fetchWrapper>>>
  }) => UseQueryResult<Awaited<ReturnType<typeof fetchWrapper>>> & { queryKey: QueryKey },
) {
  return (options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof fetchWrapper>>, unknown, Awaited<ReturnType<typeof fetchWrapper>>>
  }): ValidatedUseQueryReturnType<ReturnType<typeof useQueryWrapper>, typeof schema> => {
    const { data, ...rest } = useQueryWrapper(options)

    return {
      ...rest,
      data: rest.isSuccess ? schema.parse(data.data) : undefined,
    }
  }
}

type MyGeneric<T> = T extends (params: string, signal?: AbortSignal) => unknown
  ? (
      arg1: unknown,
      arg2?:
        | {
            query?: UseQueryOptions<Awaited<ReturnType<T>>, unknown, Awaited<ReturnType<T>>>
          }
        | undefined,
    ) => UseQueryResult<Awaited<ReturnType<T>>> & { queryKey: QueryKey }
  : T extends (signal?: AbortSignal) => unknown
  ? (
      arg1?:
        | {
            query?: UseQueryOptions<Awaited<ReturnType<T>>, unknown, Awaited<ReturnType<T>>>
          }
        | undefined,
    ) => UseQueryResult<Awaited<ReturnType<T>>> & { queryKey: QueryKey }
  : never

function factoryFun<
  TSchema extends ZodType<unknown, unknown, unknown>,
  TAxiosWrapper extends (...args: any[]) => any, // This must not be unknown
>(schema: TSchema, fetchWrapper: TAxiosWrapper, useQueryWrapper: MyGeneric<TAxiosWrapper>) {
  type QueryOptions = UseQueryOptions<Awaited<ReturnType<TAxiosWrapper>>, unknown, Awaited<ReturnType<TAxiosWrapper>>>
  type ValidatedReturnType = ValidatedUseQueryReturnType<ReturnType<MyGeneric<TAxiosWrapper>>, typeof schema>

  return fetchWrapper.length === 1
    ? function (options?: { query?: QueryOptions }): ValidatedReturnType {
        const { data, ...rest } = useQueryWrapper(options)

        return {
          ...rest,
          data: rest.isSuccess ? schema.parse(data.data) : undefined,
        }
      }
    : function (params: unknown, options?: { query?: QueryOptions }): ValidatedReturnType {
        const { data, ...rest } = useQueryWrapper(params, options)

        return {
          ...rest,
          data: rest.isSuccess ? schema.parse(data.data) : undefined,
        }
      }
}

export const a = factoryFun(bootInfoResponse, bootInfo, useBootInfo)
const { data: dataA } = a({})
export const b = factoryFun(bootInfoResponse, bootInfo, useGetFeedSettings)
const { data: dataB } = b({})
export const c = factoryFun(getFeedSettingsResponse, getFeedSettings, useBootInfo)
const { data: dataC } = c({})
export const d = factoryFun(getFeedSettingsResponse, getFeedSettings, useGetFeedSettings)
const { data: dataD } = d({})

function factoryWithArgs<TSchema extends ZodType<unknown, unknown, unknown>, TParams>(
  fetchWrapper: (args: TParams, signal?: AbortSignal) => Promise<AxiosResponse<object>>,
  useQueryWrapper: (
    args: TParams,
    options?: {
      query?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchWrapper>>,
        unknown,
        Awaited<ReturnType<typeof fetchWrapper>>
      >
    },
  ) => UseQueryResult<Awaited<ReturnType<typeof fetchWrapper>>> & { queryKey: QueryKey },
  schema: TSchema,
) {
  return (
    args: TParams,
    options?: {
      query?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchWrapper>>,
        unknown,
        Awaited<ReturnType<typeof fetchWrapper>>
      >
    },
  ): ValidatedUseQueryReturnType<ReturnType<typeof useQueryWrapper>, typeof schema> => {
    const { data, ...rest } = useQueryWrapper(args, options)

    return {
      ...rest,
      data: rest.isSuccess ? schema.parse(data.data) : undefined,
    }
  }
}

export const useValidatedBootInfo = factory(bootInfoResponse, bootInfo, useBootInfo)

export const useValidatedGetFeedSettings = factoryWithArgs<
  typeof getFeedSettingsResponse,
  Parameters<typeof getFeedSettings>[0]
>(getFeedSettings, useGetFeedSettings, getFeedSettingsResponse)
