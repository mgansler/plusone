import { createFileRoute } from '@tanstack/react-router'

import { useValidatedCommandsList } from '@plusone/elgato-api-client'

import { CommandItem } from '../app/commands/command-item'
import { COMMAND_ID_DOES_NOT_EXIST, UpdatableCommand } from '../app/commands/updatable-command'

export const Route = createFileRoute('/commands')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useValidatedCommandsList()

  return (
    <div>
      {data?.commands.map((command) => (
        <CommandItem key={command.hash} command={command} />
      ))}
      <UpdatableCommand commandId={COMMAND_ID_DOES_NOT_EXIST} />
    </div>
  )
}
