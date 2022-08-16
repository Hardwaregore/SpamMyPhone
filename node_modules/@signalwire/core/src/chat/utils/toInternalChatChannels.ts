import { InternalChatChannel } from '../..'

export const toInternalChatChannels = (
  channels: string | string[] | undefined
): InternalChatChannel[] => {
  const list = !channels || Array.isArray(channels) ? channels : [channels]

  if (Array.isArray(list)) {
    return list.map((name) => {
      return {
        name,
      }
    })
  }

  return []
}
