import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { z, ZodType } from 'zod'

type ValidatedUseQueryReturnType<
  OriginalUseQueryReturnType extends { data: unknown },
  ValidationSchema extends ZodType<unknown, unknown, unknown>,
> = Omit<OriginalUseQueryReturnType, 'data'> & {
  data: z.infer<ValidationSchema> | undefined
}

type FetchWrapper<WrappedFunction extends (...args: unknown[]) => Promise<unknown>> = (
  ...args: Parameters<WrappedFunction>
) => ReturnType<WrappedFunction>

export class ValidatedClientBuilder<TSchema extends ZodType<unknown, unknown, unknown>> {
  private readonly schema: TSchema

  constructor(schema: TSchema) {
    this.schema = schema
  }

  withFetchWrapper<TFetchWrapper extends (...args: unknown[]) => Promise<unknown>>(fetchWrapper: TFetchWrapper) {
    return new FlexibleBuilder(this.schema, fetchWrapper)
  }
}

class FlexibleBuilder<TSchema extends ZodType<unknown, unknown, unknown>, TRequiredArgs extends unknown[]> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  constructor(
    private readonly schema: TSchema,
    private readonly fetchWrapper: FetchWrapper<TRequiredArgs>,
  ) {}

  withUseQueryWrapper<
    TUseQueryWrapper extends (
      ...args: [
        ...args: Parameters<typeof this.fetchWrapper>,
        options:
          | {
              query?: UseQueryOptions
            }
          | undefined,
      ]
    ) => UseQueryResult,
  >(useQueryWrapper: TUseQueryWrapper) {
    return (
      ...args: [
        ...args: Parameters<TUseQueryWrapper>,
        options?: {
          query?: UseQueryOptions<
            Awaited<ReturnType<typeof this.fetchWrapper>>,
            unknown,
            Awaited<ReturnType<typeof this.fetchWrapper>>
          >
        },
      ]
    ): ValidatedUseQueryReturnType<ReturnType<TUseQueryWrapper>, typeof this.schema> => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { data, ...rest } = useQueryWrapper(...args)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return {
        ...rest,
        data: rest.isSuccess ? this.schema.parse(data) : undefined,
      }
    }
  }
}
