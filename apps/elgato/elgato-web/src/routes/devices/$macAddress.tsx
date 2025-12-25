import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { throttle } from 'lodash'
import { convert } from 'colvertize'

import { DeviceType, useTransitionToColor, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

import { UpdatableDisplayName } from '../../app/components/updateable-display-name'
import { LightColorPicker } from '../../app/components/color-picker'
import { DevicePowerStateControl } from '../../app/devices/device-power-state-control'
import { GetStreamDeckUrl } from '../../app/devices/get-stream-deck-url'

export const Route = createFileRoute('/devices/$macAddress')({
  component: DeviceDetailsComponent,
})

function DeviceDetailsComponent() {
  const { macAddress } = Route.useParams()

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
