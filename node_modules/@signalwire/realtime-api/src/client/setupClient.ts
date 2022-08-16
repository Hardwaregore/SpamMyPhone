import { getLogger, UserOptions } from '@signalwire/core'
import { getCredentials } from '../utils/internals'
import { clientProxyFactory } from './clientProxyFactory'
import { getClient, ClientConfig, ClientCache } from './getClient'

interface SetupClientOptions {
  project?: string
  token?: string
  logLevel?: UserOptions['logLevel']
  cache?: ClientCache
}

export const setupClient = (userOptions?: SetupClientOptions): ClientConfig => {
  const credentials = getCredentials({
    token: userOptions?.token,
    project: userOptions?.project,
  })
  const { client, store, emitter } = getClient({
    ...userOptions,
    ...credentials,
  })

  client.on('session.auth_error', () => {
    getLogger().error("Wrong credentials: couldn't connect the client.")

    // TODO: we can execute the future `onConnectError` from here.
  })

  const proxiedClient = clientProxyFactory(client)

  return {
    client: proxiedClient,
    store,
    emitter,
  }
}
