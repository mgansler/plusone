import { ActionFunction, Form, json, useActionData } from 'remix'

type ActionResponse = {
  fuelRequired: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const startingPositions = (formData.get('input') as string).split(',').map(Number)

  console.log({ startingPositions })

  return json({ fuelRequired: -1 })
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
      {result ? <div>Solution (Part 1): {result.fuelRequired}</div> : null}
    </Form>
  )
}
