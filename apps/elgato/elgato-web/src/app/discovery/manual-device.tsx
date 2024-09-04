import { useForm } from 'react-hook-form'

import { useAddManualDevice } from '@plusone/elgato-api-client'

type Fields = {
  address: string
}

export function ManualDevice() {
  const { mutate } = useAddManualDevice()

  const { register, handleSubmit } = useForm<Fields>()

  const onSubmit = (data: Fields) => {
    mutate({ address: data.address })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type={'text'} {...register('address')} />
      <button type={'submit'}>Add</button>
    </form>
  )
}
