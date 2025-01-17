import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useSetDisplayName, useValidatedDeviceDetails } from '@plusone/elgato-api-client'
import type { DeviceDetailsResponseDto } from '@plusone/elgato-api-client'

type DisplayNameFormFields = {
  displayName: string
}

type UpdatableDisplayNameProps = {
  deviceId: string
}

export function UpdatableDisplayName({ deviceId }: UpdatableDisplayNameProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const queryClient = useQueryClient()
  const { data: deviceDetails, refetch, queryKey, isLoading } = useValidatedDeviceDetails(deviceId)
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
        const displayName = (response.data as DeviceDetailsResponseDto).details.displayName
        if (displayName.length === 0) {
          setIsEditing(true)
        }
        return {
          displayName,
        }
      } catch (e) {
        console.error('Could not get current device name', e)
        return {
          displayName: '',
        }
      }
    },
  })

  const onSubmit = (data: DisplayNameFormFields) => {
    const displayName = data.displayName.trim()
    mutate({ macAddress: deviceId, data: { displayName } })
    setIsEditing(false)
  }

  if (isLoading || typeof deviceDetails === 'undefined') {
    return null
  }

  if (!isEditing) {
    return (
      <h2 style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
        {deviceDetails.details.displayName}
      </h2>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type={'text'} {...register('displayName', { minLength: 5 })} />
      <button type={'submit'} hidden={!isEditing}>
        Save
      </button>
    </form>
  )
}
