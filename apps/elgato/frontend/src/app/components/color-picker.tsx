import { useState } from 'react'
import './color-picker.scss'

export function parseRgb(rgb: string) {
  let offset = 0
  if (rgb.startsWith('#')) {
    offset = 1
  }
  const r = parseInt(rgb.substring(offset, 2 + offset), 16)
  const g = parseInt(rgb.substring(offset + 2, 4 + offset), 16)
  const b = parseInt(rgb.substring(offset + 4, 6 + offset), 16)
  return [r, g, b]
}

export function toRgb(rgb: [number, number, number]): string {
  const [r, g, b] = rgb
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function rgbToHue(rgb: string | [number, number, number]): number {
  const [r, g, b] = typeof rgb === 'string' ? parseRgb(rgb) : rgb

  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)

  if (min === max) {
    return 0
  }

  let hue: number
  switch (max) {
    case r: {
      hue = (g - b) / (max - min)
      break
    }
    case g: {
      hue = 2 + (b - r) / (max - min)
      break
    }
    case b: {
      hue = 4 + (r - g) / (max - min)
      break
    }
  }
  hue *= 60
  if (hue < 0) {
    hue += 360
  }
  return Math.floor(hue)
}

export function ColorPicker() {
  const [color, setColor] = useState(
    toRgb([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]),
  )

  return (
    <input
      type={'color'}
      value={color}
      onChange={(event) => {
        setColor(event.target.value)
      }}
    />
  )
}
