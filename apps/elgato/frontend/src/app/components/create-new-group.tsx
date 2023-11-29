import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Label, TextInput } from 'flowbite-react'
import { useId } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { useCreateGroup } from '@plusone/elgato-api-client'

type NewGroupForm = {
  name: string
  isRoom: boolean
}

type CreateNewGroupProps = {
  enforceGroupOrRoom?: 'user' | 'group' | 'room'
  queryKeys?: QueryKey[]
}

export function CreateNewGroup({ enforceGroupOrRoom, queryKeys }: CreateNewGroupProps) {
  const _enforceGroupOrRoom = enforceGroupOrRoom ?? 'user'
  const nameId = useId()
  const isRoomId = useId()

  const { register, handleSubmit } = useForm<NewGroupForm>({
    defaultValues: {
      isRoom: _enforceGroupOrRoom === 'room',
    },
  })

  const queryClient = useQueryClient()
  const { mutate: createGroup } = useCreateGroup({
    mutation: {
      onSuccess: async () => {
        for (const queryKey of queryKeys) {
          await queryClient.invalidateQueries({ queryKey })
        }
      },
    },
  })

  const createNewRoom: SubmitHandler<NewGroupForm> = (data) => {
    createGroup({ data })
  }

  return (
    <form onSubmit={handleSubmit(createNewRoom)} className={'m-1 flex gap-1 items-center'}>
      <Label htmlFor={nameId}>Name</Label>
      <TextInput id={nameId} type={'text'} {...register('name')} required={true} />

      {_enforceGroupOrRoom === 'user' ? (
        <>
          <label htmlFor={isRoomId}>Room</label>
          <input id={isRoomId} type={'checkbox'} {...register('isRoom')} />
        </>
      ) : null}

      <Button type={'submit'}>Add</Button>
    </form>
  )
}
