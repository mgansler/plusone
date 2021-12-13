import { ActionFunction, Form, json, useActionData } from 'remix'

function countPaths(edges: Record<string, string[]>, node: string, visited = new Set<string>()): number {
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
    total += countPaths(edges, next, new Set(visited))
  }

  return total
}

type ActionResponse = {
  pathCount: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const lines = (formData.get('input') as string).split('\r\n').filter((line) => line.length)

  const edges = lines.reduce((acc, currentValue) => {
    const [start, end] = currentValue.split('-')
    return {
      ...acc,
      [start]: [...(acc[start] || []), end],
      [end]: [...(acc[end] || []), start],
    }
  }, {} as Record<string, string[]>)

  return json({
    pathCount: countPaths(edges, 'start'),
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
      {result ? <div>Solution (Part 1): {result.pathCount}</div> : null}
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
