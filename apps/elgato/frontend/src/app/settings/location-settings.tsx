import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { LocationResponseDto } from '@plusone/elgato-api-client'
import { useUpdateLocation, useValidatedCurrentLocation } from '@plusone/elgato-api-client'

type LocationFormFields = {
  name: string
  longitude: number
  latitude: number
}

export function LocationSettings() {
  const [lookupFailed, setLookupFailed] = useState<boolean>(false)
  const [lookupInProgress, setLookupInProgress] = useState<boolean>(false)

  const { refetch } = useValidatedCurrentLocation({ query: { enabled: false } })
  const { mutate } = useUpdateLocation()

  const { handleSubmit, register, reset } = useForm<LocationFormFields>({
    defaultValues: async () => {
      try {
        return (await refetch()).data as LocationResponseDto
      } catch (e) {
        console.error('Could not get current location')
      }
    },
  })

  const getGeoCoordinates = () => {
    setLookupInProgress(true)
    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        reset((formValues) => {
          return {
            ...formValues,
            longitude: currentPosition.coords.longitude,
            latitude: currentPosition.coords.latitude,
          }
        })
        setLookupInProgress(false)
      },
      (postionError) => {
        if (postionError.PERMISSION_DENIED) {
          alert('Permission denied, check your settings.')
        }
        setLookupFailed(true)
        setLookupInProgress(false)
      },
    )
  }

  const onSubmit = (data: LocationFormFields) => {
    mutate({ data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Name
        <input type={'text'} {...register('name')} />
      </label>
      <button type={'button'} onClick={getGeoCoordinates} disabled={lookupInProgress}>
        get current coordinates
      </button>
      <label>
        Longitude
        <input {...register('longitude')} type={'number'} disabled={!lookupFailed} />
      </label>
      <label>
        Latitude
        <input {...register('latitude')} type={'number'} disabled={!lookupFailed} />
      </label>
      <button type={'submit'}>Save</button>
    </form>
  )
}
