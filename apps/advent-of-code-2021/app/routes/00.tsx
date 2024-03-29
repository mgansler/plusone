import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

type ActionResponse = {
  part1: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  // This is just a template
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const input = (formData.get('input') as string).split('\r\n')

  return json({ part1: -1 } as ActionResponse)
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
      {result ? <div>Solution (Part 1): {result.part1}</div> : null}
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
