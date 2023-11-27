import { useParams } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { convert } from 'colvertize'
import { throttle } from 'lodash'
import { useCallback } from 'react'

import { DeviceType, useTransitionToColor, useValidatedDeviceDetails } from '@plusone/elgato-api-client'

import { LightColorPicker } from '../components/color-picker'

import { DevicePowerStateControl } from './device-power-state-control'

export function DeviceDetails() {
  const { deviceId } = useParams()

  const queryClient = useQueryClient()
  const { data: deviceDetails, isLoading, queryKey } = useValidatedDeviceDetails(deviceId)
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
    transitionToColor({ id: deviceId, data: { hue, saturation, brightness } })
  }

  if (isLoading) {
    return null
  }

  return (
    <div>
      <h2>Device Details {deviceDetails.name}</h2>
      {deviceDetails.details.deviceType === DeviceType.LightStrip && (
        <LightColorPicker
          hue={deviceDetails.state.hue}
          saturation={deviceDetails.state.saturation}
          brightness={deviceDetails.state.brightness}
          setColor={setStripColor}
        />
      )}
      <DevicePowerStateControl deviceId={deviceId} />
    </div>
  )
}
