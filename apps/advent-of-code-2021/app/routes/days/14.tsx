import { ActionFunction, Form, json, useActionData } from 'remix'

type ActionResponse = {
  mostCommon: number
  leastCommon: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const [template, insertions] = (formData.get('input') as string).split('\r\n\r\n')

  console.log({ template, insertions })

  return json({
    mostCommon: 0,
    leastCommon: 0,
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
      {result ? <div>Solution (Part 1): {result.mostCommon - result.leastCommon}</div> : null}
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
