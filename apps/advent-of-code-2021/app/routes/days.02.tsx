import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

type ActionResponse = {
  partOne: { down: number; forward: number }
  partTwo: { aim: number; horizontalPosition: number; depth: number }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const input = rawInput.split(separator).filter((value) => value.length)

  const commands = input.map((command) => {
    const [direction, amount] = command.split(' ')
    return { direction, amount: parseInt(amount) }
  })

  const partOne = commands.reduce(
    (previousValue, { direction, amount }) => {
      switch (direction) {
        case 'up':
          return { ...previousValue, down: previousValue.down - amount }
        case 'down':
          return { ...previousValue, down: previousValue.down + amount }
        case 'forward':
          return { ...previousValue, forward: previousValue.forward + amount }
      }

      return previousValue
    },
    { forward: 0, down: 0 },
  )

  const partTwo = commands.reduce(
    (previousValue, { direction, amount }) => {
      switch (direction) {
        case 'up':
          return { ...previousValue, aim: previousValue.aim - amount }
        case 'down':
          return { ...previousValue, aim: previousValue.aim + amount }
        case 'forward':
          return {
            ...previousValue,
            horizontalPosition: previousValue.horizontalPosition + amount,
            depth: previousValue.depth + previousValue.aim * amount,
          }
      }
      return previousValue
    },
    { aim: 0, horizontalPosition: 0, depth: 0 },
  )

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
      {result?.partOne ? <div>Solution (Part 1): {result.partOne.down * result.partOne.forward}</div> : null}
      {result?.partTwo ? (
        <div>Solution (Part 2): {result.partTwo.horizontalPosition * result.partTwo.depth}</div>
      ) : null}
    </>
  )
}
