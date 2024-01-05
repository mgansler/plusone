import { useForm } from 'react-hook-form'

import type { DeviceDetailsResponse } from '@plusone/elgato-api-client'
import { useUpdateDeviceSettings, useValidatedDeviceSettings } from '@plusone/elgato-api-client'

type Fields = {
  sunrise: boolean
  sunset: boolean
}

type DeviceSettingsProps = {
  device: DeviceDetailsResponse
}

export function DeviceSettings({ device }: DeviceSettingsProps) {
  const { refetch } = useValidatedDeviceSettings(device.id, { query: { enabled: false } })
  const { mutate } = useUpdateDeviceSettings()

  const { handleSubmit, register } = useForm<Fields>({
    defaultValues: async () => {
      try {
        const response = await refetch()
        return response.data as Fields
      } catch (e) {
        return {
          sunrise: false,
          sunset: false,
        }
      }
    },
  })

  const onSubmit = (data: Fields) => {
    mutate({ id: device.id, data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {device.displayName}
      <label>
        Sunrise
        <input type={'checkbox'} {...register('sunrise')} />
      </label>
      <label>
        Sunset
        <input type={'checkbox'} {...register('sunset')} />
      </label>

      <input type={'submit'} />
    </form>
  )
}
