import { useValidatedCommandsList } from '@plusone/elgato-api-client'

import { CommandItem } from './command-item'
import { UpdatableCommand } from './updatable-command'

export function Commands() {
  const { data } = useValidatedCommandsList()

  return (
    <div>
      {data?.commands.map((command) => <CommandItem key={command.hash} command={command} />)}
      <UpdatableCommand />
    </div>
  )
}
