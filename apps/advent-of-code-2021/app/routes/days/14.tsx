import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

function parseInstructions(raw: string): Record<string, string> {
  return raw
    .split(raw.indexOf('\r') > 0 ? '\r\n' : '\n')
    .filter((line) => line.length)
    .reduce((instructions, line) => {
      const [pair, insertion] = line.split(' -> ')
      return { ...instructions, [pair]: insertion }
    }, {})
}

function templateToPairs(template: string): Record<string, number> {
  const pairs: Record<string, number> = {}
  for (let i = 0; i < template.length - 1; i++) {
    const pair = template.slice(i, i + 2)
    pairs[pair] = pairs[pair] ? pairs[pair] + 1 : 1
  }
  return pairs
}

function insert(instructions: Record<string, string>, pairs: Record<string, number>) {
  return Object.entries(pairs).reduce((acc: Record<string, number>, [pair, count]) => {
    const a = pair.slice(0, 1) + instructions[pair]
    const b = instructions[pair] + pair.slice(1, 2)

    return {
      ...acc,
      [a]: (acc[a] || 0) + count,
      [b]: (acc[b] || 0) + count,
    }
  }, {})
}

function count(pairs: Record<string, number>): Record<string, number> {
  return Object.entries(pairs).reduce((acc: Record<string, number>, [pair, count]) => {
    return {
      ...acc,
      [pair.slice(0, 1)]: (acc[pair.slice(0, 1)] || 0) + count,
    }
  }, {})
}

type ActionResponse = {
  mostCommon10: number
  leastCommon10: number
  mostCommon40: number
  leastCommon40: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n\r\n' : '\n\n'
  const [template, insertions] = rawInput.split(separator)
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

  const quantities10 = copy.split('').reduce((acc: Record<string, number>, cur) => {
    return {
      ...acc,
      [cur]: (acc[cur] || 0) + 1,
    }
  }, {})

  let pairs = templateToPairs(template)
  for (let round = 0; round < 40; round++) {
    pairs = insert(instructions, pairs)
  }

  const quantities40 = count(pairs)
  quantities40[template.slice(template.length - 1)] = quantities40[template.slice(template.length - 1)] + 1

  return json({
    mostCommon10: Math.max(...Object.values(quantities10)),
    leastCommon10: Math.min(...Object.values(quantities10)),
    mostCommon40: Math.max(...Object.values(quantities40)),
    leastCommon40: Math.min(...Object.values(quantities40)),
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
      {result ? <div>Solution (Part 1): {result.mostCommon10 - result.leastCommon10}</div> : null}
      {result ? <div>Solution (Part 2): {result.mostCommon40 - result.leastCommon40}</div> : null}
    </Form>
  )
}
