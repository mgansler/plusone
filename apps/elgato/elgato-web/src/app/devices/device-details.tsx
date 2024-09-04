import { useQueryClient } from '@tanstack/react-query'
import { convert } from 'colvertize'
import { throttle } from 'lodash'
import { useCallback } from 'react'

import { DeviceType, useTransitionToColor, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

import { deviceDetailsRoute } from '../../routes'
import { LightColorPicker } from '../components/color-picker'
import { UpdatableDisplayName } from '../components/updateable-display-name'

import { DevicePowerStateControl } from './device-power-state-control'
import { GetStreamDeckUrl } from './get-stream-deck-url'

export function DeviceDetails() {
  const { macAddress } = deviceDetailsRoute.useParams()

  const queryClient = useQueryClient()
  const { data: deviceDetails, queryKey } = useValidatedDeviceDetails(macAddress)
  const { mutate } = useTransitionToColor({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey }) },
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transitionToColor = useCallback(throttle(mutate, 1200), [])

  const setStripColor = (color: string) => {
    const { h, s, l } = convert(color, 'hsl')
    const hue = Math.round(h)
    const saturation = Math.round(s * 100)
    const brightness = Math.round(l * 100)
    transitionToColor({ macAddress, data: { hue, saturation, brightness } })
  }

  return (
    <div className={'flex flex-col gap-1 p-1'}>
      <UpdatableDisplayName deviceId={macAddress} />

      {deviceDetails?.details.deviceType === DeviceType.LightStrip && (
        <LightColorPicker
          hue={deviceDetails.state.hue ?? 0}
          saturation={deviceDetails.state.saturation ?? 0}
          brightness={deviceDetails.state.brightness ?? 0}
          setColor={setStripColor}
        />
      )}
      <DevicePowerStateControl macAddress={macAddress} />
      <GetStreamDeckUrl macAddress={macAddress} />
    </div>
  )
}
