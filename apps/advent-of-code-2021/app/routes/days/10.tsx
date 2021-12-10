import { ActionFunction, Form, json, useActionData } from 'remix'

type Opening = '[' | '{' | '(' | '<'
type Closing = ']' | '}' | ')' | '>'
const opening: Opening[] = ['[', '{', '(', '<']
const closing: Closing[] = [']', '}', ')', '>']
type Token = Opening | Closing

const syntaxErrorPoints: Record<Closing, number> = { ')': 3, '>': 25137, ']': 57, '}': 1197 }
const closingCharacterPoints: Record<Closing, number> = { ')': 1, '>': 4, ']': 2, '}': 3 }

function findFirstIllegalCharacter(line: Token[]): Closing | void {
  const openingCharacters: Opening[] = []
  for (let i = 0; i < line.length; i++) {
    if (opening.includes(line[i] as Opening)) {
      openingCharacters.push(line[i] as Opening)
    } else {
      const lastOpeningChar = openingCharacters[openingCharacters.length - 1]
      if (closing[opening.indexOf(lastOpeningChar)] == line[i]) {
        openingCharacters.pop()
      } else {
        return line[i] as Closing
      }
    }
  }
}

function getClosingCharacters(line: Token[]): Closing[] {
  const openingCharacters: Opening[] = []
  for (let i = 0; i < line.length; i++) {
    if (opening.includes(line[i] as Opening)) {
      openingCharacters.push(line[i] as Opening)
    } else {
      const lastOpeningChar = openingCharacters[openingCharacters.length - 1]
      if (closing[opening.indexOf(lastOpeningChar)] == line[i]) {
        openingCharacters.pop()
      } else {
        return []
      }
    }
  }
  return openingCharacters.map((o) => closing[opening.indexOf(o)]).reverse()
}

function calculateCompletionPoints(line: Closing[]): number {
  return line.reduce((acc, cur) => {
    return acc * 5 + closingCharacterPoints[cur]
  }, 0)
}

type ActionResponse = {
  syntaxErrorScore: number
  middleScore: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const lines = (formData.get('input') as string)
    .split('\r\n')
    .filter((line) => line.length)
    .map((line) => line.split('')) as Token[][]

  const illegalCharacters = lines.map(findFirstIllegalCharacter).filter(Boolean) as Closing[]
  const closingCharacterPoints = lines
    .map(getClosingCharacters)
    .filter((chars) => chars.length > 0)
    .map(calculateCompletionPoints)
    .sort((a, b) => a - b)

  return json({
    syntaxErrorScore: illegalCharacters.reduce((sum, cur) => sum + syntaxErrorPoints[cur], 0),
    middleScore: closingCharacterPoints[Math.floor(closingCharacterPoints.length / 2)],
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
      {result ? <div>Solution (Part 1): {result.syntaxErrorScore}</div> : null}
      {result ? <div>Solution (Part 2): {result.middleScore}</div> : null}
    </Form>
  )
}
