import { useParams } from '@remix-run/react'
import { useQueryClient } from '@tanstack/react-query'
import { convert } from 'colvertize'
import { throttle } from 'lodash'
import { useCallback } from 'react'

import {
  DeviceType,
  useTransitionToColor,
  useValidatedDeviceDetails,
  useValidatedGroupList,
} from '@plusone/elgato-api-client'
import type { GroupResponseDto } from '@plusone/elgato-api-client'

import { AddDeviceToGroup } from '../components/add-device-to-group'
import { LightColorPicker } from '../components/color-picker'

import { DevicePowerStateControl } from './device-power-state-control'

function isAssignedToGroup(deviceGroups: GroupResponseDto[], group: GroupResponseDto) {
  return deviceGroups.find((g) => g.name === group.name) !== undefined
}

export function DeviceDetails() {
  const { deviceId } = useParams()

  const queryClient = useQueryClient()
  const { data: deviceDetails, isLoading, queryKey } = useValidatedDeviceDetails(deviceId)
  const { data: groups } = useValidatedGroupList()
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
    <div className={'flex flex-col gap-1 p-1'}>
      <h2>{deviceDetails.name}</h2>

      <fieldset className={'border border-solid border-gray-300'}>
        <legend>Rooms</legend>
        {deviceDetails.groups
          .filter((g) => g.isRoom)
          .map((g) => (
            <div>{g.name}</div>
          ))}
        {groups?.groups
          .filter(
            (group: GroupResponseDto) =>
              group.isRoom && !isAssignedToGroup(deviceDetails.groups as GroupResponseDto[], group),
          )
          .map((group) => (
            <AddDeviceToGroup key={group.id} group={group as GroupResponseDto} deviceId={deviceDetails.id} />
          ))}
      </fieldset>

      <fieldset className={'border border-solid border-gray-300'}>
        <legend>Groups</legend>
        {deviceDetails.groups
          .filter((g) => !g.isRoom)
          .map((g) => (
            <div>{g.name}</div>
          ))}
        {groups?.groups
          .filter(
            (group: GroupResponseDto) =>
              !group.isRoom && !isAssignedToGroup(deviceDetails.groups as GroupResponseDto[], group),
          )
          .map((group) => (
            <AddDeviceToGroup key={group.id} group={group as GroupResponseDto} deviceId={deviceDetails.id} />
          ))}
      </fieldset>

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
