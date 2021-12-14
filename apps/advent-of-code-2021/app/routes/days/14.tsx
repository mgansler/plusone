import { ActionFunction, Form, json, useActionData } from 'remix'

function parseInstructions(raw: string): Record<string, string> {
  return raw
    .split('\r\n')
    .filter((line) => line.length)
    .reduce((instructions, line) => {
      const [pair, insertion] = line.split(' -> ')
      return { ...instructions, [pair]: insertion }
    }, {})
}

type ActionResponse = {
  mostCommon: number
  leastCommon: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const [template, insertions] = (formData.get('input') as string).split('\r\n\r\n')
  let copy = template

  const instructions = parseInstructions(insertions)

  for (let round = 0; round < 10; round++) {
    let newTemplate = ''
    for (let i = 0; i < copy.length - 1; i++) {
      const pair = copy.slice(i, i + 2)
      if (i === 0) {
        newTemplate += pair.slice(0, 1)
      }
      newTemplate += instructions[pair] + pair.slice(1, 2)
    }
    copy = newTemplate
  }

  const quantities = copy.split('').reduce((acc: Record<string, number>, cur) => {
    return {
      ...acc,
      [cur]: (acc[cur] || 0) + 1,
    }
  }, {})

  return json({
    mostCommon: Math.max(...Object.values(quantities)),
    leastCommon: Math.min(...Object.values(quantities)),
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
