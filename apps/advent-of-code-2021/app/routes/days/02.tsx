import { ActionFunction, Form, json, useActionData } from 'remix'

type ActionResponse = {
  partOne: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string).split('\r\n')

  const partOne = input
    .map((command) => {
      const [direction, amount] = command.split(' ')
      return { direction, amount: parseInt(amount) }
    })
    .reduce(
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

  return json({ partOne: partOne.down * partOne.forward })
}

export default function () {
  const result = useActionData<ActionResponse>()

  return (
    <div>
      <h2>Day 2</h2>
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
