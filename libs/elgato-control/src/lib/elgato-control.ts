import type { LightStripControlState } from './schemas'
import { lightStripControlStateSchema } from './schemas'

export async function setState(hostname: string, desiredState: LightStripControlState) {
  const body = { lights: [lightStripControlStateSchema.parse(desiredState)] }
  await fetch(`http://${hostname}:9123/elgato/lights`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function toggleOnOff(hostname: string) {
  const target = new URL(`http://${hostname}:9123/elgato/lights`)

  const current = await fetch(target).then((res) => res.json())
  await fetch(target, {
    method: 'PUT',
    body: JSON.stringify({ lights: [{ on: !current.lights[0].on }] }),
  })
}

export async function setColor(hostname: string, hue: number, saturation: number, brightness: number) {
  const target = new URL(`http://${hostname}:9123/elgato/lights`)
  await fetch(target, {
    method: 'PUT',
    body: JSON.stringify({ lights: [{ on: 1, hue, saturation, brightness }] }),
  })
}
