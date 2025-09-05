import type { InfiniteData, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query'
import type { output, ZodType } from 'zod'

export function buildValidatedUseQueryWrapper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Schema extends ZodType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UseQueryWrapper extends (...args: Array<any>) => UseQueryResult,
>(useQueryWrapper: UseQueryWrapper, schema: Schema): UseQueryWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: Array<any>): UseQueryResult => {
    const { data, ...rest } = useQueryWrapper(...args)

    if (Object.hasOwn(rest, 'hasNextPage')) {
      return {
        ...rest,
        data: rest.isSuccess
          ? {
              pagesParams: (data as InfiniteData<unknown, unknown>).pageParams,
              pages: (data as InfiniteData<unknown, unknown>).pages.map((page) => schema.parse(page)),
            }
          : undefined,
      } as UseInfiniteQueryResult<output<Schema>>
    }
    return {
      ...rest,
      data: rest.isSuccess ? schema.parse(data) : undefined,
    } as UseQueryResult<output<Schema>>
  }) as UseQueryWrapper
}
