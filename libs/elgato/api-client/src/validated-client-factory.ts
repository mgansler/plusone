import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { z, ZodType } from 'zod'

type FetchWrapperWithArg<TArg> = (arg: TArg, signal?: AbortSignal) => Promise<unknown>
type FetchWrapperWithoutArgs = (signal?: AbortSignal) => Promise<unknown>

type ValidatedUseQueryReturnType<
  OriginalUseQueryReturnType extends { data: unknown },
  ValidationSchema extends ZodType<unknown, unknown, unknown>,
> = Omit<OriginalUseQueryReturnType, 'data'> & {
  data: z.infer<ValidationSchema> | undefined
}

export class ValidatedClientBuilder<TSchema extends ZodType<unknown, unknown, unknown>> {
  private readonly schema: TSchema

  constructor(schema: TSchema) {
    this.schema = schema
  }

  fetchWrapperWithoutArgs(fetchWrapper: FetchWrapperWithoutArgs) {
    return new WithoutArgsBuilder(this.schema, fetchWrapper)
  }

  fetchWrapperWithArg<TFetchArg>(fetchWrapper: FetchWrapperWithArg<TFetchArg>) {
    return new WithArgsBuilder<typeof this.schema, TFetchArg>(this.schema, fetchWrapper)
  }
}

class WithoutArgsBuilder<TSchema extends ZodType<unknown, unknown, unknown>> {
  private readonly schema: TSchema
  private readonly fetchWrapper: FetchWrapperWithoutArgs

  constructor(schema: TSchema, fetchWrapper: FetchWrapperWithoutArgs) {
    this.schema = schema
    this.fetchWrapper = fetchWrapper
  }

  withQueryWrapper(
    useQueryWrapper: (options?: {
      query?: UseQueryOptions<
        Awaited<ReturnType<FetchWrapperWithoutArgs>>,
        unknown,
        Awaited<ReturnType<FetchWrapperWithoutArgs>>
      >
    }) => UseQueryResult<Awaited<ReturnType<typeof this.fetchWrapper>>> & { queryKey: QueryKey },
  ) {
    return (options?: {
      query?: UseQueryOptions<
        Awaited<ReturnType<typeof this.fetchWrapper>>,
        unknown,
        Awaited<ReturnType<typeof this.fetchWrapper>>
      >
    }): ValidatedUseQueryReturnType<ReturnType<typeof useQueryWrapper>, typeof this.schema> => {
      const { data, ...rest } = useQueryWrapper(options)
      return {
        ...rest,
        data: rest.isSuccess ? this.schema.parse(data) : undefined,
      }
    }
  }
}

class WithArgsBuilder<TSchema extends ZodType<unknown, unknown, unknown>, TFetchArgs> {
  private readonly schema: TSchema
  private readonly fetchWrapper: FetchWrapperWithArg<TFetchArgs>

  constructor(schema: TSchema, fetchWrapper: FetchWrapperWithArg<TFetchArgs>) {
    this.schema = schema
    this.fetchWrapper = fetchWrapper
  }

  withQueryWrapper(
    useQueryWrapper: (
      args: TFetchArgs,
      options?: {
        query?: UseQueryOptions<
          Awaited<ReturnType<FetchWrapperWithArg<TFetchArgs>>>,
          unknown,
          Awaited<ReturnType<FetchWrapperWithArg<TFetchArgs>>>
        >
      },
    ) => UseQueryResult<Awaited<ReturnType<typeof this.fetchWrapper>>> & { queryKey: QueryKey },
  ) {
    return (
      args: TFetchArgs,
      options?: {
        query?: UseQueryOptions<
          Awaited<ReturnType<typeof this.fetchWrapper>>,
          unknown,
          Awaited<ReturnType<typeof this.fetchWrapper>>
        >
      },
    ): ValidatedUseQueryReturnType<ReturnType<typeof useQueryWrapper>, typeof this.schema> => {
      const { data, ...rest } = useQueryWrapper(args, options)
      return {
        ...rest,
        data: rest.isSuccess ? this.schema.parse(data) : undefined,
      }
    }
  }
}
