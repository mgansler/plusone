import type { ActionFunction } from 'remix'
import { Form, json, useActionData } from 'remix'

type ActionResponse = {
  partOne: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string).split('\r\n')

  let partOne = 0
  for (let i = 0; i < input.length - 1; i++) {
    if (parseInt(input[i]) < parseInt(input[i + 1])) partOne++
  }

  return json({ partOne })
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <div>
      <h2>Day 1</h2>
      <Form method={'post'}>
        <label>
          <div>Input:</div>
          <textarea name={'input'} cols={30} rows={10} />
        </label>
        <br />
        <button>Solution!</button>
      </Form>
      {result?.partOne ? <div>Solution (Part 1): {result.partOne}</div> : null}
    </div>
  )
}
