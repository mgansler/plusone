import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

const STEPS = 100

type Flashed = boolean[][]
type Energy = number[][]

function resetFlashed(): Flashed {
  const flashed = Array(10)
  for (let i = 0; i < flashed.length; i++) {
    flashed[i] = Array(10).fill(false)
  }
  return flashed
}

function countFlashes(flashed: Flashed): number {
  return flashed.flat().reduce((acc, cur) => acc + (cur ? 1 : 0), 0)
}

function increaseAll(energy: Energy) {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      energy[y][x] = energy[y][x] + 1
    }
  }
}

function increaseOne(energy: Energy, x: number, y: number) {
  if (x >= 0 && y >= 0 && x <= 9 && y <= 9) {
    energy[y][x] = energy[y][x] + 1
  }
}

function resetEnergy(energy: Energy) {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (energy[y][x] > 9) {
        energy[y][x] = 0
      }
    }
  }
}

function flash(energyLevel: Energy, flashed: Flashed, x: number, y: number) {
  if (!flashed[y][x] && energyLevel[y][x] > 9) {
    flashed[y][x] = true
    // Above
    increaseOne(energyLevel, x - 1, y - 1)
    increaseOne(energyLevel, x, y - 1)
    increaseOne(energyLevel, x + 1, y - 1)
    // Left and right
    increaseOne(energyLevel, x - 1, y)
    increaseOne(energyLevel, x + 1, y)
    // Below
    increaseOne(energyLevel, x - 1, y + 1)
    increaseOne(energyLevel, x, y + 1)
    increaseOne(energyLevel, x + 1, y + 1)
  }
}

type ActionResponse = {
  flashes: number
  synchronizedAfter: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const energy = rawInput
    .split(separator)
    .filter((line) => line.length)
    .map((line) => line.split('').map(Number))

  let flashes = 0
  let synchronizedAfter = 0
  let flashed = resetFlashed()
  while (countFlashes(flashed) < 100) {
    flashed = resetFlashed()
    increaseAll(energy)
    let x = 0
    do {
      x = countFlashes(flashed)
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          flash(energy, flashed, x, y)
        }
      }
    } while (x < countFlashes(flashed))

    resetEnergy(energy)
    if (synchronizedAfter < STEPS) {
      flashes = flashes + countFlashes(flashed)
    }
    synchronizedAfter++

    if (synchronizedAfter > 1000) {
      console.log('break after 1000 rounds')
      break
    }
  }

  return json({
    flashes,
    synchronizedAfter,
  } as ActionResponse)
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <Form method={'post'}>
      <label>
        <div>Input:</div>
        <textarea name={'input'} cols={30} rows={10} />
      </label>
      <br />
      <button>Solution!</button>
      {result ? <div>Solution (Part 1): {result.flashes}</div> : null}
      {result ? <div>Solution (Part 2): {result.synchronizedAfter}</div> : null}
    </Form>
  )
}
