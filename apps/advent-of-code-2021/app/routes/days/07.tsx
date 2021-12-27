import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

type ActionResponse = {
  fuelRequiredToMedian: number
  fuelRequiredToAvg: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const startingPositions = (formData.get('input') as string).split(',').map(Number)

  // The median is the optimal position for part one
  startingPositions.sort((a, b) => a - b)
  const median = startingPositions[Math.floor(startingPositions.length / 2)]
  const fuelsToMedian = startingPositions.map((value) => Math.abs(value - median))

  // On of the positions next to the average is the optimal position for part two
  const avg =
    startingPositions.reduce((previousValue, currentValue) => previousValue + currentValue, 0) /
    startingPositions.length

  const fuelsToLowerAvg = startingPositions.map((value) => {
    const distance = Math.abs(value - Math.floor(avg))
    return (distance * (distance + 1)) / 2
  })
  const fuelsToHigherAvg = startingPositions.map((value) => {
    const distance = Math.abs(value - Math.ceil(avg))
    return (distance * (distance + 1)) / 2
  })

  return json({
    fuelRequiredToMedian: fuelsToMedian.reduce((sum, currentValue) => sum + currentValue, 0),
    fuelRequiredToAvg: Math.min(
      fuelsToLowerAvg.reduce((sum, currentValue) => sum + currentValue, 0),
      fuelsToHigherAvg.reduce((sum, currentValue) => sum + currentValue, 0),
    ),
  })
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
      {result ? <div>Solution (Part 1): {result.fuelRequiredToMedian}</div> : null}
      {result ? <div>Solution (Part 2): {result.fuelRequiredToAvg}</div> : null}
    </Form>
  )
}
