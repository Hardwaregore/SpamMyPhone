export * from './toInternalChatChannels'

export const isValidChannels = (input: unknown): input is string | string[] => {
  return Array.isArray(input) || typeof input === 'string'
}
