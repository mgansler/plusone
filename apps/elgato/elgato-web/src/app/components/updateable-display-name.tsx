import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useSetDisplayName, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

type DisplayNameFormFields = {
  displayName: string
}

type UpdatableDisplayNameProps = {
  deviceId: string
}

export function UpdatableDisplayName({ deviceId }: Readonly<UpdatableDisplayNameProps>) {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const queryClient = useQueryClient()
  const { data: deviceDetails, queryKey, isLoading } = useValidatedDeviceDetails(deviceId)

  const { mutate } = useSetDisplayName({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey })
      },
    },
  })

  const { handleSubmit, register } = useForm<DisplayNameFormFields>({ values: deviceDetails })

  const onSubmit = (data: DisplayNameFormFields) => {
    const displayName = data.displayName.trim()
    mutate({ macAddress: deviceId, data: { displayName } })
    setIsEditing(false)
  }

  const enableEditMode = isEditing || (!isLoading && (deviceDetails?.displayName?.length ?? 0) < 1)

  if (isLoading || typeof deviceDetails === 'undefined') {
    return null
  }

  if (!enableEditMode) {
    return (
      <h2 style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
        {deviceDetails.details.displayName}
      </h2>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        className={'border-2 border-gray-200 rounded-sm p-1'}
        type={'text'}
        {...register('displayName', { minLength: 5 })}
      />
      <button type={'submit'} hidden={!enableEditMode}>
        Save
      </button>
    </form>
  )
}
