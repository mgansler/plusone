import { ActionFunction, Form, json, useActionData } from 'remix'

type ActionResponse = {
  riskLevelSumLowPoints: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const heightmap = (formData.get('input') as string)
    .split('\r\n')
    .filter((line) => line.length)
    .map((row) => row.split('').map(Number))
  const columnCount = heightmap[0].length
  const rowCount = heightmap.length

  const lowPoints: Array<{ row: number; col: number; value: number }> = []

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

  return json({
    riskLevelSumLowPoints: lowPoints.reduce((sum, cur) => sum + cur.value + 1, 0),
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
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
