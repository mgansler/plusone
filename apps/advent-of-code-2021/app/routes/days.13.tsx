import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

type Point = {
  x: number
  y: number
}

type Paper = boolean[][]

type Instruction = {
  axis: 'x' | 'y'
  index: number
}

function initDots(dimX: number, dimY: number, dotCoors: Point[]): Paper {
  const paper: Paper = []
  for (let y = 0; y < dimY; y++) {
    paper.push(Array(dimX).fill(false))
  }

  dotCoors.forEach(({ x, y }) => {
    paper[y][x] = true
  })

  return paper
}

function parseInstructions(instructions: string) {
  return instructions
    .split(instructions.indexOf('\r') > 0 ? '\r\n' : '\n')
    .filter((line) => line.length)
    .map((line) => {
      const [axis, index] = line.replace('fold along ', '').split('=')
      return { axis, index } as unknown as Instruction
    })
}

function foldX(paper: Paper, index: number): Paper {
  for (let y = 0; y < paper.length; y++) {
    for (let x = 0; x < index; x++) {
      paper[y][x] = paper[y][x] || paper[y][paper[y].length - x - 1]
    }
  }
  return paper.map((row) => row.slice(0, index))
}

function foldY(paper: Paper, index: number): Paper {
  for (let y = 0; y < index; y++) {
    for (let x = 0; x < paper[y].length; x++) {
      paper[y][x] = paper[y][x] || paper[paper.length - y - 1][x]
    }
  }
  return paper.slice(0, index)
}

function fold(paper: Paper, instruction: Instruction): Paper {
  return instruction.axis === 'x' ? foldX(paper, instruction.index) : foldY(paper, instruction.index)
}

function countDots(paper: Paper): number {
  return paper.flat().reduce((sum, cur) => sum + (cur ? 1 : 0), 0)
}

type ActionResponse = {
  numberOfDotsAfterOneFold: number
  folded: Paper
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const rawInput = formData.get('input') as string
  const separator = rawInput.indexOf('\r') > 0 ? '\r\n' : '\n'
  const [dots, instructions] = rawInput.split(`${separator}${separator}`)

  const dotCoords = dots.split(separator).map((coords) => {
    const [x, y] = coords.split(',').map(Number)
    return { x, y }
  })

  const dimX = Math.max(...dotCoords.map(({ x }) => x)) + 1
  let dimY = Math.max(...dotCoords.map(({ y }) => y)) + 1
  if (dimY % 2 === 0) {
    dimY++
  }

  const paper = initDots(dimX, dimY, dotCoords)
  const parsedInstructions = parseInstructions(instructions)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const firstInstruction = parsedInstructions.shift()!
  const foldedOnce = fold(paper, firstInstruction)
  const numberOfDotsAfterOneFold = countDots(foldedOnce)

  let folded = foldedOnce
  parsedInstructions.forEach((instruction) => {
    folded = fold(folded, instruction)
  })

  return json({
    numberOfDotsAfterOneFold,
    folded,
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
      {result ? <div>Solution (Part 1): {result.numberOfDotsAfterOneFold}</div> : null}
      {result ? (
        <div>
          Solution (Part 2)
          <br />
          {result.folded.map((row, index) => (
            <span key={index}>
              {row.map((dot) => (dot ? '\u26ab' : '\u26aa'))}
              <br />
            </span>
          ))}
        </div>
      ) : null}
    </Form>
  )
}
