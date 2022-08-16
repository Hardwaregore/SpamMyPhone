import { RealtimeClient, clientConnect } from '../client/index'
import type { ExecuteParams } from '@signalwire/core'

export const clientContextInterceptorsFactory = (client: RealtimeClient) => {
  return {
    async addContexts(contexts: string[]) {
      await clientConnect(client)
      const executeParams: ExecuteParams = {
        method: 'signalwire.receive',
        params: {
          contexts,
        },
      }

      // @ts-expect-error
      return client.execute(executeParams)
    },
    async removeContexts(contexts: string[]) {
      await clientConnect(client)
      const executeParams: ExecuteParams = {
        method: 'signalwire.unreceive',
        params: {
          contexts,
        },
      }

      // @ts-expect-error
      return client.execute(executeParams)
    },
  }
}
