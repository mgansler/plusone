import { useValidatedCommandsList } from '@plusone/elgato-api-client'

import { CommandItem } from './command-item'
import { COMMAND_ID_DOES_NOT_EXIST, UpdatableCommand } from './updatable-command'

export function Commands() {
  const { data } = useValidatedCommandsList()

  return (
    <div>
      {data?.commands.map((command) => <CommandItem key={command.hash} command={command} />)}
      <UpdatableCommand commandId={COMMAND_ID_DOES_NOT_EXIST} />
    </div>
  )
}
