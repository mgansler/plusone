import { useForm } from 'react-hook-form'

import type { DeviceResponseDto } from '@plusone/elgato-api-client'
import { useUpdateDeviceSettings, useValidatedDeviceSettings } from '@plusone/elgato-api-client'

type DeviceSettingsForm = {
  sunrise: boolean
  sunset: boolean
}

type DeviceSettingsProps = {
  device: DeviceResponseDto
}

export function DeviceSettings({ device }: DeviceSettingsProps) {
  const { refetch } = useValidatedDeviceSettings(device.id, { query: { enabled: false } })
  const { mutate } = useUpdateDeviceSettings()

  const { handleSubmit, register } = useForm<DeviceSettingsForm>({
    defaultValues: async () => {
      try {
        const response = await refetch()
        return response.data as DeviceSettingsForm
      } catch (e) {
        return {
          sunrise: false,
          sunset: false,
        }
      }
    },
  })

  const onSubmit = (data: DeviceSettingsForm) => {
    mutate({ id: device.id, data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {device.name}
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
