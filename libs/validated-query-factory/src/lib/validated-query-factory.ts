import { useMemo } from 'react'
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
    const rawData = useQueryResult.data

    const data = useMemo(() => {
      if (!useQueryResult.isSuccess || rawData === undefined) {
        return undefined
      }
      try {
        if (Object.hasOwn(useQueryResult, 'hasNextPage')) {
          // Handle infinite queries
          const infiniteData = rawData as InfiniteData<unknown, unknown>
          return { ...infiniteData, pages: infiniteData.pages.map((page) => schema.parse(page)) }
        }
        // Handle regular queries
        return schema.parse(rawData)
      } catch (parseError) {
        // A schema violation means the backend drifted from the spec (the
        // schema is generated from the same OpenAPI spec as the hook), so
        // this is a contract bug, not a data condition. Throwing on purpose:
        // crash loudly instead of masking the mismatch behind a generic
        // query error state.
        throw new Error(`${useQueryWrapper.name} response failed schema validation`, {
          cause: parseError,
        })
      }
    }, [rawData, useQueryResult.isSuccess])

    // The generated hooks expose their fields (including `data`) as getter-only
    // properties, so we must return a copy instead of mutating the result.
    return { ...useQueryResult, data } as UseQueryResult
  }) as UseQueryWrapper
}
