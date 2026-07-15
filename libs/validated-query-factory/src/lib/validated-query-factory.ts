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

    let data: unknown
    if (Object.hasOwn(useQueryResult, 'hasNextPage')) {
      // Handle infinite queries
      data = useQueryResult.isSuccess
        ? {
            pagesParams: (useQueryResult.data as InfiniteData<unknown, unknown>).pageParams,
            pages: (useQueryResult.data as InfiniteData<unknown, unknown>).pages.map((page) => schema.parse(page)),
          }
        : undefined
    } else {
      // Handle regular queries
      data = useQueryResult.isSuccess ? schema.parse(useQueryResult.data) : undefined
    }

    // The generated hooks expose their fields (including `data`) as getter-only
    // properties, so we must return a copy instead of mutating the result.
    return { ...useQueryResult, data } as UseQueryResult
  }) as UseQueryWrapper
}
