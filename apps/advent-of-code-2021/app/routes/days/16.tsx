import { ActionFunction, Form, json, useActionData } from 'remix'

// I trust the input, this will return
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function readBytes(byteInput: string): [string[], string] {
  const bytes = []
  let isLast = false
  for (let i = 0; i < byteInput.length && !isLast; i = i + 5) {
    bytes.push(byteInput.slice(i, i + 5))
    if (byteInput.slice(i, i + 1) === '0') {
      isLast = true
      return [bytes, byteInput.slice(i + 5)]
    }
  }
}

function parsePacket(packet: string): [number, string] {
  const version = parseInt(packet.slice(0, 3), 2)
  const typeId = parseInt(packet.slice(3, 6), 2)
  const lengthTypeId = parseInt(packet.slice(6, 7), 2)
  // console.log({ packet }, { version, typeId, lengthTypeId })

  if (typeId === 4) {
    const [bytes, rest] = readBytes(packet.slice(6))
    const value = parseInt(bytes.map((b) => b.slice(1)).join(''), 2)
    // console.log({ value })
    return [version, rest]
  }

  if (lengthTypeId === 0) {
    // 15 bits representing the number of bits in the sub-packets.
    const numberOfBitsInSubPackets = parseInt(packet.slice(8, 8 + 15 - 1), 2)
    let rest = packet.slice(8 + 15 - 1, 8 + 15 - 1 + numberOfBitsInSubPackets)
    let vSum = 0
    while (rest.length !== 0) {
      const res = parsePacket(rest)
      vSum += res[0]
      rest = res[1]
    }
    return [vSum + version, packet.slice(8 + 15 - 1 + numberOfBitsInSubPackets)]
  } else {
    // 11 bits representing the number of sub-packets immediately contained by this packet.
    const numberOfSubPackets = parseInt(packet.slice(8, 8 + 11 - 1), 2)
    let rest = packet.slice(8 + 11 - 1)
    let vSum = 0
    for (let i = 0; i < numberOfSubPackets; i++) {
      const res = parsePacket(rest)
      vSum += res[0]
      rest = res[1]
    }
    return [vSum + version, rest]
  }
}

type ActionResponse = {
  part1: number
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const input = (formData.get('input') as string)
    .split('')
    .map((char) => (parseInt(char, 16) >>> 0).toString(2))
    .map((bin) => {
      switch (bin.length) {
        case 1:
          return '000' + bin
        case 2:
          return '00' + bin
        case 3:
          return '0' + bin
        default:
          return bin
      }
    })
    .join('')

  const [part1] = parsePacket(input)

  return json({ part1 } as ActionResponse)
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
