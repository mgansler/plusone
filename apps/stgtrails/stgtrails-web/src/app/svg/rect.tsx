import type { SVGProps } from 'react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import type { SvgTooltipProps, TooltipState } from './shared'
import { getTooltipInnerStyles, getTooltipOuterStyles } from './shared'

export function Rect({ text, portal, ...props }: SvgTooltipProps & SVGProps<SVGRectElement>) {
  const [tooltipState, setTooltipState] = useState<TooltipState>({ visible: false, x: 0, y: 0 })

  return (
    <>
      <rect
        {...props}
        aria-label={text}
        onMouseEnter={(event) => setTooltipState({ visible: true, x: event.clientX, y: event.clientY })}
        onMouseLeave={() => setTooltipState({ visible: false, x: 0, y: 0 })}
      />
      {tooltipState.visible &&
        createPortal(
          <div style={getTooltipOuterStyles(tooltipState)}>
            <div style={getTooltipInnerStyles()}>{text}</div>
          </div>,
          portal,
        )}
    </>
  )
}
