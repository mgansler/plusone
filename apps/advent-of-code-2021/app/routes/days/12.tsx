import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

function countPathsPartOne(edges: Record<string, string[]>, node: string, visited = new Set<string>()): number {
  // we have been there already and cannot visit again => invalid path
  if (node === node.toLowerCase() && visited.has(node)) {
    return 0
  }
  visited.add(node)

  // We reached the end, hurray!
  if (node === 'end') {
    return 1
  }

  let total = 0
  for (const next of edges[node]) {
    total += countPathsPartOne(edges, next, new Set(visited))
  }

  return total
}

function countPathsPartTwo(
  edges: Record<string, string[]>,
  node: string,
  visited = new Set<string>(),
  usedJoker = false,
): number {
  if (node === node.toLowerCase()) {
    visited.add(node)
  }

  // We reached the end, hurray!
  if (node === 'end') {
    return 1
  }

  let total = 0
  for (const next of edges[node]) {
    // We cannot go back to start and cannot use the joker twice
    if (next === 'start' || (visited.has(next) && usedJoker)) {
      continue
    }

    if (visited.has(next)) {
      // use the joker
      total += countPathsPartTwo(edges, next, new Set(visited), true)
    } else {
      // we have not been here before, pass through if we have used the joker yet
      total += countPathsPartTwo(edges, next, new Set(visited), usedJoker)
    }
  }

  return total
}

type ActionResponse = {
  partOne: number
  partTwo: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const lines = rawInput.split(separator).filter((line) => line.length)

  const edges = lines.reduce((acc, currentValue) => {
    const [start, end] = currentValue.split('-')
    return {
      ...acc,
      [start]: [...(acc[start] || []), end],
      [end]: [...(acc[end] || []), start],
    }
  }, {} as Record<string, string[]>)

  return json({
    partOne: countPathsPartOne(edges, 'start'),
    partTwo: countPathsPartTwo(edges, 'start'),
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
      {result ? <div>Solution (Part 1): {result.partOne}</div> : null}
      {result ? <div>Solution (Part 2): {result.partTwo}</div> : null}
    </Form>
  )
}
