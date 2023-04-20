import type { z, ZodType } from 'zod'

import type { bootInfo } from './client'
import { useBootInfo } from './client'
import { bootInfoResponse } from './zod'

type ValidatedUseQueryReturnType<
  OriginalUseQueryReturnType extends { data: any },
  ValidationSchema extends ZodType<any, any, any>,
> = Omit<OriginalUseQueryReturnType, 'data'> & {
  data: z.infer<ValidationSchema> | undefined
}

export function useValidatedBootInfo(
  options: Parameters<typeof useBootInfo<Awaited<ReturnType<typeof bootInfo>>>>[0],
): ValidatedUseQueryReturnType<ReturnType<typeof useBootInfo>, typeof bootInfoResponse> {
  const { data, ...rest } = useBootInfo(options)

  return {
    ...rest,
    data: rest.isSuccess ? bootInfoResponse.parse(data.data) : undefined,
  }
}
