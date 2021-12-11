import { ActionFunction, Form, json, useActionData } from 'remix'

const STEPS = 100

type ActionResponse = {
  flashes: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const lines = (formData.get('input') as string).split('\r\n').filter((line) => line.length)

  return json({
    flashes: -1,
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
      {result ? <div>Solution (Part 1): {result.flashes}</div> : null}
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
