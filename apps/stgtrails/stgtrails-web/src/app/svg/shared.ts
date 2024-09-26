import type { CSSProperties } from 'react'

export type SvgTooltipProps = {
  text: string
  portal: HTMLElement
}

export type TooltipState = {
  visible: boolean
  x: number
  y: number
}

export function getTooltipOuterStyles(tooltipState: TooltipState): CSSProperties {
  return {
    borderRadius: 5,
    overflow: 'hidden',
    position: 'absolute',
    pointerEvents: 'none',
    top: tooltipState.y - 10,
    left: tooltipState.x + 10,
  }
}

export function getTooltipInnerStyles(): CSSProperties {
  return {
    backdropFilter: 'blur(2px)',
  }
}
