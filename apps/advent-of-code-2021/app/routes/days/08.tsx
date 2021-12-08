import { ActionFunction, Form, json, useActionData } from 'remix'

type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type Mapping = Record<Digit, Segment[]>

function includesAll(pattern: Segment[], other: Segment[]) {
  let result = true
  for (const otherElement of other) {
    if (!pattern.includes(otherElement)) {
      result = false
    }
  }
  return result
}

function decodeDigits(patterns: Segment[]): Mapping {
  const sortedPatterns = patterns.map((p) => p.split('').sort() as Segment[])

  const lengthOfFive = sortedPatterns.filter((p) => p.length === 5)
  const lengthOfSix = sortedPatterns.filter((p) => p.length === 6)

  const mapping: Mapping = {
    '0': [],
    '1': sortedPatterns.filter((p) => p.length === 2)[0],
    '2': [],
    '3': [],
    '4': sortedPatterns.filter((p) => p.length === 4)[0],
    '5': [],
    '6': [],
    '7': sortedPatterns.filter((p) => p.length === 3)[0],
    '8': sortedPatterns.filter((p) => p.length === 7)[0],
    '9': [],
  }

  for (const pattern of lengthOfFive) {
    /**
     * must be 3 if contains all segments of 1
     * must be 5 if contains all segments of 4 that are not in 1
     * must be 2 otherwise
     */
    const in4ButNot1 = mapping[4].filter((value) => !mapping[1].includes(value))
    if (includesAll(pattern, mapping[1])) {
      mapping[3] = pattern
    } else if (includesAll(pattern, in4ButNot1)) {
      mapping[5] = pattern
    } else {
      mapping[2] = pattern
    }
  }

  for (const pattern of lengthOfSix) {
    /**
     * must be 6 if not contains all of 1
     * must be 9 if contains all of 4
     * must be 0 otherwise
     */
    if (includesAll(pattern, mapping[4])) {
      mapping[9] = pattern
    } else if (!includesAll(pattern, mapping[1])) {
      mapping[6] = pattern
    } else {
      mapping[0] = pattern
    }
  }

  return mapping
}

function mapToDigit(segment: Segment[], mapping: Mapping): string {
  let digit = ''
  Object.entries(mapping).forEach(([key, mappedSegment]) => {
    if (segment.length === mappedSegment.length && includesAll(segment, mappedSegment)) {
      digit = key
    }
  })

  return digit
}

function readOutputValue(segments: string[], mapping: Mapping): number {
  const outputSegments = segments.map((s) => s.split('').sort())
  let value = ''
  for (const segment of outputSegments) {
    value += mapToDigit(segment as Segment[], mapping)
  }
  return Number(value)
}

type ActionResponse = {
  numberOfDigits: number
  outputValuesSum: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string)
    .split('\r\n')
    .filter((line) => line.length)
    .map((line) => {
      const [patterns, output] = line.split(' | ')
      return { signalPatterns: patterns.split(' '), outputValue: output.split(' ') }
    })

  // Part 1
  const numberOfDigits = input.reduce((previousValue, { outputValue }) => {
    const unique: number[] = outputValue.map((value) => ([2, 3, 4, 7].includes(value.length) ? 1 : 0))
    return previousValue + unique.reduce((sum, cur) => sum + cur, 0)
  }, 0)

  // Part 2
  const outputValuesSum = input.reduce((previousValue, { signalPatterns, outputValue }) => {
    return previousValue + readOutputValue(outputValue as Segment[], decodeDigits(signalPatterns as Segment[]))
  }, 0)

  return json({
    numberOfDigits,
    outputValuesSum,
  })
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
      {result ? <div>Solution (Part 1): {result.numberOfDigits}</div> : null}
      {result ? <div>Solution (Part 2): {result.outputValuesSum}</div> : null}
    </Form>
  )
}
