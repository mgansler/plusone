import type { Attributes } from 'react'
import { useState } from 'react'

import type { CommandResponseDto } from '@plusone/elgato-api-client'
import { useDeleteCommand, useTriggerAppleShortcutsCommand } from '@plusone/elgato-api-client'

import { UpdatableCommand } from './updatable-command'

type CommandItemProps = Attributes & {
  command: CommandResponseDto
}

export function CommandItem({ command }: CommandItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const { mutate: runCommand } = useTriggerAppleShortcutsCommand()
  const { mutate: deleteCommand } = useDeleteCommand()

  const copyToClipboard = async () => {
    const origin = window.origin
    await window.navigator.clipboard.writeText(`${origin}/api/public/apple-shortcuts/${command.hash}`)
  }

  return (
    <div className={'flex flex-col'}>
      <div>{command.name}</div>
      <button onClick={copyToClipboard}>{command.hash}</button>
      <button onClick={() => runCommand({ hash: command.hash })}>Run command</button>
      <button onClick={() => setIsEditing(true)}>Edit Command</button>
      <button
        onClick={() => {
          deleteCommand({ commandId: command.id })
        }}
      >
        Delete Command
      </button>
      {isEditing && <UpdatableCommand commandId={command.id} />}
    </div>
  )
}
