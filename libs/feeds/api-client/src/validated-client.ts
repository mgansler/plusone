import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { z, ZodType } from 'zod'

import { bootInfo, useBootInfo } from './client'
import { bootInfoResponse } from './zod'

type ValidatedUseQueryReturnType<
  OriginalUseQueryReturnType extends { data: unknown },
  ValidationSchema extends ZodType<unknown, unknown, unknown>,
> = Omit<OriginalUseQueryReturnType, 'data'> & {
  data: z.infer<ValidationSchema> | undefined
}

function factory<Schema extends ZodType<unknown, unknown, unknown>>(
  fetchWrapper: (signal?: AbortSignal) => Promise<AxiosResponse<object>>,
  useQueryWrapper: (options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof fetchWrapper>>, unknown, Awaited<ReturnType<typeof fetchWrapper>>>
  }) => UseQueryResult<Awaited<ReturnType<typeof fetchWrapper>>> & { queryKey: QueryKey },
  schema: Schema,
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

export const useValidatedBootInfo = factory<typeof bootInfoResponse>(bootInfo, useBootInfo, bootInfoResponse)
