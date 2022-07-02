import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

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

  const neighbours = getNeighbours(start, visited)
  for (const { x, y } of neighbours) {
    distanceMap[y][x] = Math.min(distanceMap[start.y][start.x] + map[y][x], distanceMap[y][x])
  }
}

function expand(map: Map): Map {
  const rows: Map = []
  const expanded: Map = []
  // expand right
  map.forEach((row) => {
    const newRow = [...row]
    for (let round = 1; round < 5; round++) {
      newRow.push(...row.map((el) => (el + round > 9 ? el + round - 9 : el + round)))
    }
    rows.push(newRow)
  })

  // expand down
  for (let round = 0; round < 5; round++) {
    rows.forEach((row) => {
      expanded.push(row.map((el) => (el + round > 9 ? el + round - 9 : el + round)))
    })
  }

  return expanded
}

type ActionResponse = {
  part1: number
  part2: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const input = rawInput.split(separator).filter((l) => l.length)
  const map = input.map((line) => line.split('').map(Number))
  const visited = initVisited(map)
  const distanceMap = initDistanceMap(map)

  while (findNext(distanceMap, visited)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    visit(findNext(distanceMap, visited)!, map, distanceMap, visited)
  }

  const expanded = expand(map)
  const expandedVisited = initVisited(expanded)
  const expandedDistanceMap = initDistanceMap(expanded)

  let next = { x: 0, y: 0 }
  while (next) {
    visit(next, expanded, expandedDistanceMap, expandedVisited)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    next = findNext(expandedDistanceMap, expandedVisited)!
  }

  return json({
    part1: distanceMap[map.length - 1][map.length - 1],
    part2: expandedDistanceMap[expandedDistanceMap.length - 1][expandedDistanceMap.length - 1],
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
      {result ? <div>Solution (Part 1): {result.part1}</div> : null}
      {result ? <div>Solution (Part 2): {result.part2}</div> : null}
    </Form>
  )
}
