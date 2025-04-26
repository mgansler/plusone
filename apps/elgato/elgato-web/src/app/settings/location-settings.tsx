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
        console.error('Could not get current location', e)
        return {} as LocationResponseDto
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
    <form className={' max-w-xl'} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className={'border border-solid border-gray-300 flex flex-col'}>
        <legend>Location</legend>

        <label className={'grid grid-cols-[2fr_1fr_3fr]'}>
          Name
          <input className={'max-w-40 border-2 border-gray-200 rounded-sm p-1'} type={'text'} {...register('name')} />
          <button type={'button'} onClick={getGeoCoordinates} disabled={lookupInProgress}>
            get current coordinates
          </button>
        </label>

        <label className={'grid grid-cols-[2fr_1fr_3fr]'}>
          Longitude
          <input className={'max-w-40'} type={'number'} {...register('longitude')} disabled={!lookupFailed} />
        </label>

        <label className={'grid grid-cols-[2fr_1fr_3fr]'}>
          Latitude
          <input className={'max-w-40'} type={'number'} {...register('latitude')} disabled={!lookupFailed} />
        </label>

        <button type={'submit'}>Save</button>
      </fieldset>
    </form>
  )
}
