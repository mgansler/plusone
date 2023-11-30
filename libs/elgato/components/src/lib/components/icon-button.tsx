import type { MouseEventHandler, ReactNode } from 'react'

type IconButtonProps = {
  label?: string
  onClick: MouseEventHandler
  icon: ReactNode
}

export function IconButton({ onClick, icon, label }: IconButtonProps) {
  return (
    <div role={'button'} onClick={onClick} aria-label={label}>
      {icon}
    </div>
  )
}
