import { useQueryClient } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'

import {
  getGetCommandsQueryKey,
  useCreateCommand,
  useGetCommand,
  useUpdateCommand,
  useValidatedDeviceList,
} from '@plusone/elgato-api-client'

type UpdatableCommandFields = {
  name: string
  actions: Array<{
    macAddress: string
    on: boolean
    powerOnly: boolean
    hue?: string
    saturation?: string
    brightness?: string
  }>
}

const actionDefaults = {
  macAddress: '',
  on: true,
  powerOnly: true,
}

type UpdatableCommandProps = {
  commandId?: number
}

export function UpdatableCommand({ commandId }: UpdatableCommandProps) {
  const queryClient = useQueryClient()
  const onMutationSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: getGetCommandsQueryKey() })
  }

  // @ts-expect-error commandId may be undefined, but we only enable the query if it's a number
  const { data: currentCommand } = useGetCommand(commandId, { query: { enabled: typeof commandId === 'number' } })
  const { data: deviceList } = useValidatedDeviceList()
  const { mutate: createCommand } = useCreateCommand({ mutation: { onSuccess: onMutationSuccess } })
  const { mutate: updateCommand } = useUpdateCommand({ mutation: { onSuccess: onMutationSuccess } })

  const { control, handleSubmit, register, getValues } = useForm<UpdatableCommandFields>({
    values: currentCommand as UpdatableCommandFields,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'actions' })

  const onSubmit = (formContent: UpdatableCommandFields) => {
    const data = {
      ...formContent,
      actions: formContent.actions.map((action) => ({
        ...action,
        hue: action.hue === '' ? undefined : Number(action.hue),
        brightness: action.brightness === '' ? undefined : Number(action.brightness),
        saturation: action.saturation === '' ? undefined : Number(action.saturation),
      })),
    }

    if (typeof commandId === 'undefined') {
      createCommand({ data })
    } else {
      updateCommand({ commandId, data })
    }
  }

  const availableDevices = deviceList?.devices.filter(
    ({ macAddress }) => !(getValues('actions') ?? []).map((action) => action.macAddress).includes(macAddress),
  )

  return (
    <form className={' max-w-xl flex flex-col'} onSubmit={handleSubmit(onSubmit)}>
      <label>
        Command Name
        <input className={'border-2 border-gray-200 rounded-sm p-1'} type={'text'} {...register('name')} />
      </label>

      {fields.map((field, index) => {
        const selectedDevice = deviceList?.devices.find(
          (device) => device.macAddress === getValues('actions')[index].macAddress,
        )

        return (
          <fieldset className={'border border-solid border-gray-300 flex flex-col p-2'} key={field.id}>
            <label className={'grid grid-cols-[2fr_3fr_2fr]'}>
              Device
              <select className={'max-w-60'} {...register(`actions.${index}.macAddress` as const)}>
                {selectedDevice && <option value={selectedDevice.macAddress}>{selectedDevice.displayName}</option>}
                {availableDevices?.map((device) => (
                  <option key={device.macAddress} value={device.macAddress}>
                    {device.displayName}
                  </option>
                ))}
              </select>
            </label>

            <label className={'grid grid-cols-[2fr_3fr_2fr]'}>
              Power State
              <input className={'max-w-60'} type={'checkbox'} {...register(`actions.${index}.on` as const)} />
            </label>

            <label className={'grid grid-cols-[2fr_3fr_2fr]'}>
              Power Only
              <input className={'max-w-60'} type={'checkbox'} {...register(`actions.${index}.powerOnly` as const)} />
            </label>

            <label className={'grid grid-cols-[2fr_3fr_2fr]'}>
              Hue
              <input className={'max-w-60'} type={'number'} {...register(`actions.${index}.hue` as const)} />
            </label>

            <label className={'grid grid-cols-[2fr_3fr_2fr]'}>
              Saturation
              <input className={'max-w-60'} type={'number'} {...register(`actions.${index}.saturation` as const)} />
            </label>

            <label className={'grid grid-cols-[2fr_3fr_2fr]'}>
              Brightness
              <input className={'max-w-60'} type={'number'} {...register(`actions.${index}.brightness` as const)} />
            </label>

            <button type={'button'} onClick={() => remove(index)}>
              Remove Action
            </button>
          </fieldset>
        )
      })}

      <button type={'button'} onClick={() => append(actionDefaults)}>
        Add Action
      </button>

      <input type={'submit'} />
    </form>
  )
}
