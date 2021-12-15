import { ActionFunction, Form, json, useActionData } from 'remix'

type Visited = boolean[][]
type Map = number[][]
type Point = {
  x: number
  y: number
}

function initVisited(map: Map): Visited {
  const visited: Visited = []
  for (let row = 0; row < map.length; row++) {
    visited.push(Array(map.length).fill(false))
  }
  return visited
}

function initDistanceMap(map: Map): Map {
  const distanceMap: Map = []
  for (let row = 0; row < map.length; row++) {
    distanceMap.push(Array(map.length).fill(Infinity))
  }
  distanceMap[0][0] = 0
  return distanceMap
}

function getNeighbours({ x, y }: Point, visited: Visited): Point[] {
  const neighbours: Point[] = []
  if (x > 0) neighbours.push({ x: x - 1, y })
  if (x < visited.length - 1) neighbours.push({ x: x + 1, y })
  if (y > 0) neighbours.push({ x, y: y - 1 })
  if (y < visited.length - 1) neighbours.push({ x, y: y + 1 })
  return neighbours.filter(({ x, y }) => !visited[y][x])
}

function findNext(distanceMap: Map, visited: Visited): Point | undefined {
  let shortestDistance = Infinity
  let nextPoint: Point | undefined = undefined
  for (let y = 0; y < distanceMap.length; y++) {
    for (let x = 0; x < distanceMap.length; x++) {
      if (!visited[y][x] && distanceMap[y][x] < shortestDistance) {
        shortestDistance = distanceMap[y][x]
        nextPoint = { x, y }
      }
    }
  }
  return nextPoint
}

function visit(start: Point, map: Map, distanceMap: Map, visited: Visited) {
  visited[start.y][start.x] = true
  if (visited.flat().filter((el) => !el).length === 0) {
    return
  }
  const neighbours = getNeighbours(start, visited)
  for (const { x, y } of neighbours) {
    distanceMap[y][x] = Math.min(distanceMap[start.y][start.x] + map[y][x], distanceMap[y][x])
  }
}

type ActionResponse = {
  part1: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string).split('\r\n').filter((l) => l.length)
  const map = input.map((line) => line.split('').map(Number))
  const visited = initVisited(map)
  const distanceMap = initDistanceMap(map)

  while (findNext(distanceMap, visited)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    visit(findNext(distanceMap, visited)!, map, distanceMap, visited)
  }

  return json({ part1: distanceMap[map.length - 1][map.length - 1] } as ActionResponse)
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
