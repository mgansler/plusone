import type { z, ZodSchema, ZodType, ZodTypeDef } from 'zod'

type ValidatedUseQueryReturnType<
  OriginalUseQueryReturnType extends { data: unknown },
  ValidationSchema extends ZodType<unknown, ZodTypeDef, unknown>,
> = Omit<OriginalUseQueryReturnType, 'data'> & {
  data: z.infer<ValidationSchema> | undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildValidatedUseQueryWrapper<S extends ZodSchema, T extends (...args: Array<any>) => any>(
  useQueryWrapper: T,
  schema: S,
) {
  return (...args: Parameters<typeof useQueryWrapper>): ValidatedUseQueryReturnType<ReturnType<T>, S> => {
    const { data, ...rest } = useQueryWrapper(...args)
    return {
      ...rest,
      data: rest.isSuccess ? schema.parse(data) : undefined,
    }
  }
}
