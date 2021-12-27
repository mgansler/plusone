import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

const DIMENSION = 1000
const THRESHOLD = 2

type Line = {
  x1: number
  x2: number
  y1: number
  y2: number
}

const ventsMap = (() => {
  const map: number[][] = []
  const row = Array(DIMENSION).fill(0)
  for (let x = 0; x < DIMENSION; x++) {
    map[x] = [...row]
  }
  return map
})()

function parseLine(input: string): Line {
  const [start, end] = input.split(' -> ')
  const [x1, y1] = start.split(',').map(Number)
  const [x2, y2] = end.split(',').map(Number)

  return { x1, x2, y1, y2 }
}

function isVerticalOrHorizontal({ x1, x2, y1, y2 }: Line): boolean {
  return x1 === x2 || y1 === y2
}

function isDiagonal({ x1, x2, y1, y2 }: Line): boolean {
  return Math.abs(x1 - x2) === Math.abs(y1 - y2)
}

type ActionResponse = {
  vertAndHor: number
  all: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const linesRaw = (formData.get('input') as string).split('\r\n').filter((line) => line.length)

  const parsedLines = linesRaw.map(parseLine)

  const mappedHorAndVertVents = parsedLines
    .filter(isVerticalOrHorizontal)
    .reduce((previousValue, { x1, x2, y1, y2 }) => {
      // One of these will not loop as x1 === x2 or y1 === y2
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          previousValue[y][x] = previousValue[y][x] + 1
        }
      }
      return previousValue
    }, ventsMap)

  const vertAndHor = mappedHorAndVertVents.flat().filter((val) => val >= THRESHOLD).length

  const allVentsMapped = parsedLines.filter(isDiagonal).reduce((previousValue, { x1, x2, y1, y2 }) => {
    const startY = Math.min(x1, x2) === x1 ? y1 : y2
    const endY = y1 === startY ? y2 : y1
    let y = Math.min(y1, y2)

    // Always draw left to right
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      const step = x - Math.min(x1, x2)
      // Draw upwards or downwards
      y = startY + (startY < endY ? step : -1 * step)
      previousValue[y][x] = previousValue[y][x] + 1
    }
    return previousValue
  }, mappedHorAndVertVents)

  const all = allVentsMapped.flat().filter((val) => val >= THRESHOLD).length

  return json({ vertAndHor, all })
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
      {result ? <div>Solution (Part 1): {result.vertAndHor}</div> : null}
      {result ? <div>Solution (Part 2): {result.all}</div> : null}
    </Form>
  )
}
