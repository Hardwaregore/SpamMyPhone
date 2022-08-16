export type PaginationCursor =
  | {
      before: string
      after?: never
    }
  | {
      before?: never
      after: string
    }

export type ClientContextMethod = 'signalwire.receive' | 'signalwire.unreceive'

export interface ClientContextContract {
  addContexts(contexts: string[]): Promise<{ message: string; code: number }>
  removeContexts(contexts: string[]): Promise<{ message: string; code: number }>
}
