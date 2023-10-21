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
  const { handleSubmit, register, reset } = useForm<DeviceSettingsForm>()

  useValidatedDeviceSettings(device.id, {
    query: {
      onSuccess: (data) => reset(data),
    },
  })
  const { mutate } = useUpdateDeviceSettings()

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
