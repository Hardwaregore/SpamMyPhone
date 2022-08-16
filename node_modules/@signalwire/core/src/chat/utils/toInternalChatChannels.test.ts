import { toInternalChatChannels } from './toInternalChatChannels'

describe('toInternalChatChannels', () => {
  it('should convert a single string channel to array of objects', () => {
    const result = toInternalChatChannels('watercooler')

    expect(result).toStrictEqual([
      {
        name: 'watercooler',
      },
    ])
  })

  it('should convert multiple channels to array of objects', () => {
    const result = toInternalChatChannels(['channel1', 'channel2'])

    expect(result).toStrictEqual([
      {
        name: 'channel1',
      },
      {
        name: 'channel2',
      },
    ])
  })

  it('should return empty array when undefined', () => {
    const result = toInternalChatChannels(undefined)

    expect(result).toStrictEqual([])
  })
})
