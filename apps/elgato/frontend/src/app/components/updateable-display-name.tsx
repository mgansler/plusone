import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import type { DeviceDetailsResponseDto } from '@plusone/elgato-api-client'
import { useSetDisplayName, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

type DisplayNameFormFields = {
  displayName: string
}

type UpdatableDisplayNameProps = {
  deviceId: string
}

export function UpdatableDisplayName({ deviceId }: UpdatableDisplayNameProps) {
  const queryClient = useQueryClient()
  const { refetch, queryKey } = useValidatedDeviceDetails(deviceId)
  const { mutate } = useSetDisplayName({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey })
      },
    },
  })

  const { handleSubmit, register } = useForm<DisplayNameFormFields>({
    defaultValues: async () => {
      try {
        const response = await refetch()
        return {
          displayName: (response.data as DeviceDetailsResponseDto).details.displayName,
        }
      } catch (e) {
        return {
          displayName: '',
        }
      }
    },
  })

  const onSubmit = (data: DisplayNameFormFields) => {
    mutate({ id: deviceId, data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type={'text'} {...register('displayName')} />
      <button type={'submit'}>Save</button>
    </form>
  )
}
