import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

type ActionResponse = {
  partOne: number
  partTwo: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string).split('\r\n').filter((value) => value.length)
  const values = input.map(Number)

  let partOne = 0
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] < values[i + 1]) partOne++
  }

  let partTwo = 0
  for (let i = 0; i < values.length - 3; i++) {
    const firstWindow = values[i] + values[i + 1] + values[i + 2]
    const secondWindow = values[i + 1] + values[i + 2] + values[i + 3]
    if (firstWindow < secondWindow) partTwo++
  }

  return json({ partOne, partTwo })
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <>
      <Form method={'post'}>
        <label>
          <div>Input:</div>
          <textarea name={'input'} cols={30} rows={10} />
        </label>
        <br />
        <button>Solution!</button>
      </Form>
      {result?.partOne ? <div>Solution (Part 1): {result.partOne}</div> : null}
      {result?.partTwo ? <div>Solution (Part 2): {result.partTwo}</div> : null}
    </>
  )
}
