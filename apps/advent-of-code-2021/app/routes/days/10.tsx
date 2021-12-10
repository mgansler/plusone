import { ActionFunction, Form, json, useActionData } from 'remix'

type Opening = '[' | '{' | '(' | '<'
type Closing = ']' | '}' | ')' | '>'
const opening: Opening[] = ['[', '{', '(', '<']
const closing: Closing[] = [']', '}', ')', '>']
type Token = Opening | Closing

const points: Record<Closing, number> = { ')': 3, '>': 25137, ']': 57, '}': 1197 }

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

type ActionResponse = {
  syntaxErrorScore: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const lines = (formData.get('input') as string)
    .split('\r\n')
    .filter((line) => line.length)
    .map((line) => line.split('')) as Token[][]

  const illegalCharacters = lines.map(findFirstIllegalCharacter).filter(Boolean) as Closing[]

  return json({ syntaxErrorScore: illegalCharacters.reduce((sum, cur) => sum + points[cur], 0) } as ActionResponse)
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
      {result ? <div>Solution (Part 2): TBD</div> : null}
    </Form>
  )
}
