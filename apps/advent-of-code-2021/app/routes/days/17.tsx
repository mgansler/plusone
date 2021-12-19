import { ActionFunction, Form, json, useActionData } from 'remix'

type Position = {
  x: number
  y: number
}

type Target = {
  min: Position
  max: Position
}

enum Probe {
  Travelling,
  Missed,
  Hit,
}

type Velocity = {
  x: number
  y: number
}

function hitsTarget(velocity: Velocity, position: Position, targetArea: Target): boolean {
  if (position.x > targetArea.max.x || position.y < targetArea.max.y) {
    // console.log('Probe is at ', { position }, 'and has missed!')
    return false
  }

  if (
    position.x >= targetArea.min.x &&
    position.x <= targetArea.max.x &&
    position.y <= targetArea.min.y &&
    position.y >= targetArea.max.y
  ) {
    return true
  }

  return hitsTarget(
    { x: Math.max(velocity.x - 1, 0), y: velocity.y - 1 },
    {
      x: position.x + velocity.x,
      y: position.y + velocity.y,
    },
    targetArea,
  )
}

function highestPoint(y: number): number {
  // Gauss again
  return (y * (y + 1)) / 2
}

type ActionResponse = {
  part1: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = formData.get('input') as string

  const match = input.match(/target area: x=(\d+)\.\.(\d+), y=(-\d+)\.\.(-\d+)/)
  if (!match) {
    throw 'check your input'
  }

  const [_, x1s, x2s, y1s, y2s] = match
  const x1 = Number(x1s)
  const x2 = Number(x2s)
  const y1 = Number(y2s)
  const y2 = Number(y1s)

  const hits: Velocity[] = []
  for (let x = 1; x < x2; x++) {
    for (let y = -y2; y > y2; y--) {
      const hit = hitsTarget({ x, y }, { x: 0, y: 0 }, { min: { x: x1, y: y1 }, max: { x: x2, y: y2 } })
      if (hit) {
        hits.push({ x, y })
      }
    }
  }
  return json({ part1: highestPoint(hits.sort((a, b) => b.y - a.y)[0].y) } as ActionResponse)
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
      {result ? <div>Solution (Part 1): {result.part1}</div> : null}
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
