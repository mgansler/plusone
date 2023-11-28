import type { MouseEventHandler } from 'react'

import { Lightbulb } from '../icons'

type PowerControlProps = {
  state: 'on' | 'off'
  onClick: MouseEventHandler<HTMLDivElement>
}

export function PowerControl({ state, onClick }: PowerControlProps) {
  return (
    <div role={'button'} className={'w-[24px] h-[24px] mx-1'} onClick={onClick}>
      <Lightbulb variant={state === 'on' ? 'solid' : 'outline'} />
    </div>
  )
}
