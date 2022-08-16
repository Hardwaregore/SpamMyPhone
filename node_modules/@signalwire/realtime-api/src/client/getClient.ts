import {
  ClientEvents,
  configureStore,
  connect,
  EventEmitter,
  UserOptions,
} from '@signalwire/core'
import { setupInternals } from '../utils/internals'
import { Client, RealtimeClient } from './Client'

export interface ClientConfig {
  client: RealtimeClient
  store: ReturnType<typeof configureStore>
  emitter: EventEmitter<any>
}

export type ClientCache = Map<string, ClientConfig>

const CLIENTS_MAP: ClientCache = new Map()

const getClientKey = ({
  project,
  token,
}: {
  project: string
  token: string
}) => {
  return `${project}:${token}`
}

const createClient = (userOptions: {
  project: string
  token: string
  logLevel?: UserOptions['logLevel']
  store: ReturnType<typeof configureStore>
  emitter: EventEmitter
}) => {
  const client = connect<ClientEvents, Client, RealtimeClient>({
    store: userOptions.store,
    Component: Client,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(userOptions)

  return client
}

export const getClient = ({
  cache = CLIENTS_MAP,
  ...userOptions
}: {
  project: string
  token: string
  logLevel?: UserOptions['logLevel']
  cache?: ClientCache
}): ClientConfig => {
  const clientKey = getClientKey({
    project: userOptions.project,
    token: userOptions.token,
  })

  if (cache.has(clientKey)) {
    // @ts-expect-error
    return cache.get(clientKey)
  } else {
    const { emitter, store } = setupInternals(userOptions)
    const client = createClient({
      ...userOptions,
      store,
      emitter,
    })
    const config: ClientConfig = {
      client,
      store,
      emitter,
    }
    cache.set(clientKey, config)
    return config
  }
}
