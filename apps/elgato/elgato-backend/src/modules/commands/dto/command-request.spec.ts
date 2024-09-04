import { commandRequestSchema } from './command-request.dto'

describe('commandRequestSchema', () => {
  it('should accept valid request', () => {
    const input = {
      name: 'CommandName',
      actions: [
        {
          name: 'Device One',
          macAddress: 'de:vi:c1',
          on: true,
          powerOnly: true,
        },
        {
          name: 'Device Two',
          macAddress: 'de:vi:c2',
          on: true,
          powerOnly: true,
        },
      ],
    }

    commandRequestSchema.parse(input)
  })

  it('should reject duplicated macAddress', () => {
    const input = {
      name: 'CommandName',
      actions: [
        {
          name: 'Device One',
          macAddress: 'de:vi:ce',
          on: true,
          powerOnly: true,
        },
        {
          name: 'Device Two',
          macAddress: 'de:vi:ce',
          on: true,
          powerOnly: true,
        },
      ],
    }

    expect(() => commandRequestSchema.parse(input)).toThrow()
  })
})
