import type { UserOptions } from '@signalwire/core'
import { setupClient, clientConnect } from '../client/index'
import type { Messaging } from './Messaging'
import { createMessagingObject } from './Messaging'
import { clientContextInterceptorsFactory } from '../common/clientContext'
export type {
  MessagingClientApiEvents,
  RealTimeMessagingApiEventsHandlerMapping,
} from '../types'
export type {
  MessageReceivedEventName,
  MessageUpdatedEventName,
} from '@signalwire/core'

interface MessagingClient extends Messaging {
  new (opts: MessagingClientOptions): this
}

export interface MessagingClientOptions
  extends Omit<UserOptions, '_onRefreshToken'> {}

/**
 * You can use instances of this class to send or receive messages. Please see
 * {@link MessagingClientApiEvents} for the full list of events you can subscribe
 * to.
 *
 * @param params - {@link MessagingClientOptions}
 *
 * @example
 *
 * ```javascript
 * const client = new Messaging.Client({
 *   project: "<project-id>",
 *   token: "<api-token>",
 *   contexts: ['office']
 * })
 *
 * client.on('message.received', (message) => {
 *   console.log('message.received', message)
 * })
 *
 * await client.send({
 *   context: 'office',
 *   from: '+1xxx',
 *   to: '+1yyy',
 *   body: 'Hello World!'
 * })
 * ```
 */
const MessagingClient = function (options?: MessagingClientOptions) {
  const { client, store, emitter } = setupClient(options)

  const messaging = createMessagingObject({
    store,
    emitter,
  })

  client.once('session.connected', () => {
    // @ts-expect-error
    messaging.applyEmitterTransforms()
  })

  const messagingOn: Messaging['on'] = (...args) => {
    clientConnect(client)

    return messaging.on(...args)
  }
  const messagingOnce: Messaging['once'] = (...args) => {
    clientConnect(client)

    return messaging.once(...args)
  }
  const send: Messaging['send'] = async (...args) => {
    await clientConnect(client)

    return messaging.send(...args)
  }
  const disconnect = () => client.disconnect()

  const interceptors = {
    ...clientContextInterceptorsFactory(client),
    on: messagingOn,
    once: messagingOnce,
    send: send,
    _session: client,
    disconnect,
  } as const

  return new Proxy<Omit<MessagingClient, 'new'>>(messaging, {
    get(target, prop, receiver) {
      if (prop in interceptors) {
        // @ts-expect-error
        return interceptors[prop]
      }

      return Reflect.get(target, prop, receiver)
    },
  })
  // For consistency with other constructors we'll make TS force the use of `new`
} as unknown as { new (options?: MessagingClientOptions): MessagingClient }

export { MessagingClient as Client }
