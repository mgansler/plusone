import type { Attributes } from 'react'
import { useForm } from 'react-hook-form'

import type { DeviceResponseDto } from '@plusone/elgato-api-client'
import { useUpdateDeviceSettings, useValidatedDeviceList, useValidatedDeviceSettings } from '@plusone/elgato-api-client'

type Fields = {
  sunrise: boolean
  sunset: boolean
}

type DeviceSettingsProps = Attributes & {
  device: DeviceResponseDto
}

export function DeviceSettings({ device }: DeviceSettingsProps) {
  const { data: currentDeviceSettings } = useValidatedDeviceSettings(device.macAddress)
  const { mutate } = useUpdateDeviceSettings()

  const { handleSubmit, register } = useForm<Fields>({ values: currentDeviceSettings })

  const onSubmit = (data: Fields) => {
    mutate({ macAddress: device.macAddress, data })
  }

  return (
    <form className={'m-2'} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className={'border border-solid border-gray-300 flex flex-col'}>
        <legend>{device.displayName}</legend>

        <label>
          Sunrise
          <input type={'checkbox'} {...register('sunrise')} />
        </label>

        <label>
          Sunset
          <input type={'checkbox'} {...register('sunset')} />
        </label>

        <input type={'submit'} />
      </fieldset>
    </form>
  )
}

export function DevicesSettings() {
  const { data: { devices } = {} } = useValidatedDeviceList()

  return (
    <fieldset className={'max-w-xl border border-solid border-gray-300 flex flex-col'}>
      <legend>Devices</legend>
      {devices?.map((device) => <DeviceSettings key={device.macAddress} device={device} />)}
    </fieldset>
  )
}
