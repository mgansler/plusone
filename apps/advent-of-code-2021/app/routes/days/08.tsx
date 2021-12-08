import { ActionFunction, Form, json, useActionData } from 'remix'

type ActionResponse = {
  numberOfDigits: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string).split('\r\n').map((line) => {
    const [signalPatterns, outputValue] = line.split(' | ')
    return { signalPatterns, outputValue }
  })

  const numberOfDigits = input.reduce((previousValue, { outputValue }) => {
    const outputDigits = outputValue.split(' ')
    const unique: number[] = outputDigits.map((value) => ([2, 3, 4, 7].includes(value.length) ? 1 : 0))
    return previousValue + unique.reduce((sum, cur) => sum + cur, 0)
  }, 0)

  return json({
    numberOfDigits,
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
      {result ? <div>Solution (Part 1): {result.numberOfDigits}</div> : null}
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
