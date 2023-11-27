import { convert } from 'colvertize'

type LightStripProps = {
  hue: number
  saturation: number
  brightness: number
  setColor: (color: string) => void
}

export function LightColorPicker({ hue, saturation, brightness, setColor }: LightStripProps) {
  const color = convert({ h: hue, s: saturation / 100, l: brightness / 100 }, 'css-hex')

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
