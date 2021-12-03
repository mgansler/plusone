import { ActionFunction, Form, json, useActionData } from 'remix'

type ActionResponse = number
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string).split('\r\n')

  const mappedInput = input.map((value) => [...value].map((x) => (x === '0' ? -1 : 1)))
  const numberDigits = mappedInput[0].length

  const res = (
    mappedInput
      .reduce((previousValue, currentValue) => {
        return previousValue.map((value, index) => value + currentValue[index])
      }, Array(numberDigits).fill(0))
      .map((x) => (x > 0 ? 1 : 0)) as number[]
  ).reduce((previousValue, currentValue, currentIndex) => {
    return previousValue + currentValue * 2 ** (numberDigits - 1 - currentIndex)
  }, 0)

  return json(res * (res ^ (2 ** numberDigits - 1)))
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <div>
      <h2>Day 3</h2>
      <Form method={'post'}>
        <label>
          <div>Input:</div>
          <textarea name={'input'} cols={30} rows={10} />
        </label>
        <br />
        <button>Solution!</button>
      </Form>
      {result !== undefined ? <div>Solution (Part 1): {result}</div> : null}
    </div>
  )
}
