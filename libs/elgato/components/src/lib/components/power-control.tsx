import type { MouseEventHandler } from 'react'

import { LightbulbOutline } from '../icons/lightbulb-outline'
import { LightbulbSolid } from '../icons/lightbulb-solid'

type PowerControlProps = {
  state: 'on' | 'off'
  onClick: MouseEventHandler<HTMLDivElement>
}

export function PowerControl({ state, onClick }: PowerControlProps) {
  return (
    <div role={'button'} className={'w-[24px] h-[24px] mx-1'} onClick={onClick}>
      {state === 'on' ? <LightbulbSolid /> : <LightbulbOutline />}
    </div>
  )
}
