import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

type Point = { row: number; col: number; value: number }
type Coords = Omit<Point, 'value'>

function isPointInBasin(basin: Coords[], { row, col }: Coords): boolean {
  let found = false
  if (basin.findIndex((p) => p.col === col && p.row === row) >= 0) {
    found = true
  }
  return found
}

function findBasin(map: number[][], { row, col }: Coords): Coords[] {
  const columnCount = map[0].length
  const rowCount = map.length

  const basin: Coords[] = [{ row, col }]
  let basinSize = 1

  do {
    basinSize = basin.length
    for (const { row: r, col: c } of basin) {
      // check left
      if (c > 0 && map[r][c - 1] === 0 && !isPointInBasin(basin, { row: r, col: c - 1 })) {
        basin.push({ row: r, col: c - 1 })
      }
      // check right
      if (c < columnCount - 1 && map[r][c + 1] === 0 && !isPointInBasin(basin, { row: r, col: c + 1 })) {
        basin.push({ row: r, col: c + 1 })
      }
      // check above
      if (r > 0 && map[r - 1][c] === 0 && !isPointInBasin(basin, { row: r - 1, col: c })) {
        basin.push({ row: r - 1, col: c })
      }
      // check below
      if (r < rowCount - 1 && map[r + 1][c] === 0 && !isPointInBasin(basin, { row: r + 1, col: c })) {
        basin.push({ row: r + 1, col: c })
      }
    }
  } while (basin.length > basinSize)

  return basin
}

type ActionResponse = {
  riskLevelSumLowPoints: number
  basinSize: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const heightmap = rawInput
    .split(separator)
    .filter((line) => line.length)
    .map((row) => row.split('').map(Number))

  const columnCount = heightmap[0].length
  const rowCount = heightmap.length

  const lowPoints: Point[] = []

  heightmap.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      let isLowPoint = true

      // check below
      if (rowIndex < rowCount - 1 && heightmap[rowIndex + 1][columnIndex] <= value) {
        isLowPoint = false
      }

      // check above
      if (rowIndex > 0 && heightmap[rowIndex - 1][columnIndex] <= value) {
        isLowPoint = false
      }

      // check left
      if (columnIndex > 0 && heightmap[rowIndex][columnIndex - 1] <= value) {
        isLowPoint = false
      }

      // check right
      if (columnIndex < columnCount - 1 && heightmap[rowIndex][columnIndex + 1] <= value) {
        isLowPoint = false
      }

      if (isLowPoint) {
        lowPoints.push({ row: rowIndex, col: columnIndex, value })
      }
    })
  })

  const normalizedHeightmap = (formData.get('input') as string)
    .split(separator)
    .filter((line) => line.length)
    .map((row) => row.split('').map((x) => (x === '9' ? 1 : 0)))

  const basins = lowPoints.map(({ row, col }) => {
    return findBasin(normalizedHeightmap, { row, col })
  })
  const basinSizes = basins.map((basin) => basin.length).sort((a, b) => b - a)

  return json({
    riskLevelSumLowPoints: lowPoints.reduce((sum, cur) => sum + cur.value + 1, 0),
    basinSize: basinSizes[0] * basinSizes[1] * basinSizes[2],
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
      {result ? <div>Solution (Part 1): {result.riskLevelSumLowPoints}</div> : null}
      {result ? <div>Solution (Part 2): {result.basinSize}</div> : null}
    </Form>
  )
}
