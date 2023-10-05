import { useState } from 'react'
import { useForm } from 'react-hook-form'

type LocationFormFields = {
  name: string
  longitude: number
  latitude: number
}

export function LocationSettings() {
  const [lookupFailed, setLookupFailed] = useState<boolean>(false)
  const [lookupInProgress, setLookupInProgress] = useState<boolean>(false)

  const { handleSubmit, register, reset } = useForm<LocationFormFields>()
  const getGeoCoordinates = () => {
    setLookupInProgress(true)
    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        console.log(currentPosition)

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

  const checkPermissions = () => {
    navigator.permissions.query({ name: 'geolocation' }).then((res) => {
      console.log(res)
      alert(res.state)
    })
  }

  const onSubmit = (data) => {
    console.log(data)
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
      <button type={'button'} onClick={checkPermissions}>
        check permissions
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
