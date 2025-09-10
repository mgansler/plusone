import type { InfiniteData, UseQueryResult } from '@tanstack/react-query'
import type { ZodType } from 'zod'

export function buildValidatedUseQueryWrapper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Schema extends ZodType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UseQueryWrapper extends (...args: Array<any>) => UseQueryResult,
>(useQueryWrapper: UseQueryWrapper, schema: Schema): UseQueryWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: Array<any>): UseQueryResult => {
    const useQueryResult = useQueryWrapper(...args)

    if (Object.hasOwn(useQueryResult, 'hasNextPage')) {
      // Handle infinite queries
      useQueryResult.data = useQueryResult.isSuccess
        ? {
            pagesParams: (useQueryResult.data as InfiniteData<unknown, unknown>).pageParams,
            pages: (useQueryResult.data as InfiniteData<unknown, unknown>).pages.map((page) => schema.parse(page)),
          }
        : undefined
    } else {
      // Handle regular queries
      useQueryResult.data = useQueryResult.isSuccess ? schema.parse(useQueryResult.data) : undefined
    }

    return useQueryResult
  }) as UseQueryWrapper
}
