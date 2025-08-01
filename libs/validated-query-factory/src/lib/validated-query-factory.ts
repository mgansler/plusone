import type { UseQueryResult } from '@tanstack/react-query'
import type { output, ZodArray, ZodObject } from 'zod'

export function buildValidatedUseQueryWrapper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Schema extends ZodObject<any> | ZodArray<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UseQueryWrapper extends (...args: Array<any>) => UseQueryResult,
>(useQueryWrapper: UseQueryWrapper, schema: Schema): UseQueryWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: Array<any>): UseQueryResult => {
    const { data, ...rest } = useQueryWrapper(...args)
    return {
      ...rest,
      data: rest.isSuccess ? schema.parse(data) : undefined,
    } as UseQueryResult<output<Schema>>
  }) as UseQueryWrapper
}
