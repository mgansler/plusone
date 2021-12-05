import { ActionFunction, Form, json, useActionData } from 'remix'

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

function filterHorOrVert({ x1, x2, y1, y2 }: Line): boolean {
  return x1 === x2 || y1 === y2
}

type ActionResponse = {
  overlaps: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const linesRaw = (formData.get('input') as string).split('\r\n')

  const mappedVents = linesRaw
    .map(parseLine)
    .filter(filterHorOrVert)
    .reduce((previousValue, { x1, x2, y1, y2 }) => {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          previousValue[x][y] = previousValue[x][y] + 1
        }
      }
      return previousValue
    }, ventsMap)

  const overlaps = mappedVents.flat().filter((val) => val >= THRESHOLD).length

  return json({ overlaps })
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
      {result ? <div>Solution (Part 1): {result.overlaps}</div> : null}
    </Form>
  )
}
