import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { z, ZodType } from 'zod'

type FetchWrapperWithArgs<TArgs> = (args: TArgs, signal?: AbortSignal) => Promise<AxiosResponse<object>>
type FetchWrapperWithoutArgs = (signal?: AbortSignal) => Promise<AxiosResponse<object>>

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

  wrapperWithoutArgs(fetchWrapper: FetchWrapperWithoutArgs) {
    return new WithoutArgsBuilder(this.schema, fetchWrapper)
  }

  wrapperWithArgs<TArgs>(fetchWrapper: FetchWrapperWithArgs<TArgs>) {
    return new WithArgsBuilder<typeof this.schema, TArgs>(this.schema, fetchWrapper)
  }
}

class WithoutArgsBuilder<TSchema extends ZodType<unknown, unknown, unknown>> {
  private readonly schema: TSchema
  private readonly fetchWrapper: FetchWrapperWithoutArgs

  constructor(schema: TSchema, fetchWrapper: FetchWrapperWithoutArgs) {
    this.schema = schema
    this.fetchWrapper = fetchWrapper
  }

  build(
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
        data: rest.isSuccess ? this.schema.parse(data.data) : undefined,
      }
    }
  }
}

class WithArgsBuilder<TSchema extends ZodType<unknown, unknown, unknown>, TArgs> {
  private readonly schema: TSchema
  private readonly fetchWrapper: FetchWrapperWithArgs<TArgs>

  constructor(schema: TSchema, fetchWrapper: FetchWrapperWithArgs<TArgs>) {
    this.schema = schema
    this.fetchWrapper = fetchWrapper
  }

  build(
    useQueryWrapper: (
      args: TArgs,
      options?: {
        query?: UseQueryOptions<
          Awaited<ReturnType<FetchWrapperWithArgs<TArgs>>>,
          unknown,
          Awaited<ReturnType<FetchWrapperWithArgs<TArgs>>>
        >
      },
    ) => UseQueryResult<Awaited<ReturnType<typeof this.fetchWrapper>>> & { queryKey: QueryKey },
  ) {
    return (
      args: TArgs,
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
        data: rest.isSuccess ? this.schema.parse(data.data) : undefined,
      }
    }
  }
}
