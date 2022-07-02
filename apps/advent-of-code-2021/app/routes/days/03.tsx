import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

function foo(x: number[][], position: number) {
  const ones: number[][] = []
  const zeros: number[][] = []

  for (let i = 0; i < x.length; i++) {
    if (x[i][position] === 0) {
      zeros.push(x[i])
    } else {
      ones.push(x[i])
    }
  }

  return { ones, zeros }
}

function findMostCommon(x: number[][], position: number): number[] {
  if (position >= x[0].length || x.length === 1) {
    return x[0]
  }

  const { ones, zeros } = foo(x, position)

  return findMostCommon(zeros.length > ones.length ? zeros : ones, position + 1)
}

function findLeastCommon(x: number[][], position: number): number[] {
  if (position >= x[0].length || x.length === 1) {
    return x[0]
  }

  const { ones, zeros } = foo(x, position)

  return findLeastCommon(zeros.length <= ones.length ? zeros : ones, position + 1)
}

function binToInt(bin: number[]): number {
  return bin.reduce(
    (previousValue, currentValue, currentIndex) => previousValue + currentValue * 2 ** (bin.length - currentIndex - 1),
    0,
  )
}

type ActionResponse = {
  partOne: number
  partTwo: number
}
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const input = rawInput.split(separator).filter((value) => value.length)

  const mappedInput = input.map((value) => [...value].map((x) => (x === '0' ? -1 : 1)))
  const numberDigits = mappedInput[0].length

  const mostCommon = findMostCommon(
    input.map((value) => [...value].map((x) => parseInt(x))),
    0,
  )
  const leastCommon = findLeastCommon(
    input.map((value) => [...value].map((x) => parseInt(x))),
    0,
  )

  const res = (
    mappedInput
      .reduce((previousValue, currentValue) => {
        return previousValue.map((value, index) => value + currentValue[index])
      }, Array(numberDigits).fill(0))
      .map((x) => (x > 0 ? 1 : 0)) as number[]
  ).reduce((previousValue, currentValue, currentIndex) => {
    return previousValue + currentValue * 2 ** (numberDigits - 1 - currentIndex)
  }, 0)

  return json({ partOne: res * (res ^ (2 ** numberDigits - 1)), partTwo: binToInt(mostCommon) * binToInt(leastCommon) })
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
      {result !== undefined ? <div>Solution (Part 1): {result.partOne}</div> : null}
      {result !== undefined ? <div>Solution (Part 2): {result.partTwo}</div> : null}
    </>
  )
}
