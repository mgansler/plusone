import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

const DAYS_PART_1 = 80
const DAYS_PART_2 = 256

type State = {
  0: number
  1: number
  2: number
  3: number
  4: number
  5: number
  6: number
  7: number
  8: number
}

function nextDay(state: State): State {
  return {
    0: state[1],
    1: state[2],
    2: state[3],
    3: state[4],
    4: state[5],
    5: state[6],
    6: state[7] + state[0],
    7: state[8],
    8: state[0],
  }
}

type ActionResponse = {
  lanternFishCount80days: number
  lanternFishCount256days: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const startingFishCount = (formData.get('input') as string).split(',').map(Number) as Array<
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  >

  let state = startingFishCount.reduce(
    (previousValue, currentValue) => {
      return {
        ...previousValue,
        [currentValue]: previousValue[currentValue] + 1,
      }
    },
    { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
  )

  for (let day = 0; day < DAYS_PART_1; day++) {
    state = nextDay(state)
  }

  const lanternFishCount80days = Object.values(state).reduce(
    (previousValue, currentValue) => previousValue + currentValue,
    0,
  )

  for (let day = DAYS_PART_1; day < DAYS_PART_2; day++) {
    state = nextDay(state)
  }

  const lanternFishCount256days = Object.values(state).reduce(
    (previousValue, currentValue) => previousValue + currentValue,
    0,
  )

  return json({ lanternFishCount80days, lanternFishCount256days })
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
      {result ? <div>Solution (Part 1): {result.lanternFishCount80days}</div> : null}
      {result ? <div>Solution (Part 2): {result.lanternFishCount256days}</div> : null}
    </Form>
  )
}
