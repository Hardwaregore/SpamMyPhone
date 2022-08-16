import {
  DisconnectableClientContract,
  BaseComponentOptions,
  EventTransform,
  toExternalJSON,
  ClientContextContract,
} from '@signalwire/core'
import { connect, BaseComponent } from '@signalwire/core'
import type { MessagingClientApiEvents } from '../types'
import { RealtimeClient } from '../client/index'
import { messagingWorker } from './workers'
import { MessageContract, Message } from './Message'

interface MessagingSendParams {
  context?: string
  from: string
  to: string
  body?: string
  tags?: string[]
  region?: string
  media?: string[]
}

interface InternalMessagingSendParams
  extends Omit<MessagingSendParams, 'from' | 'to'> {
  from_number: string
  to_number: string
}

export interface MessagingSendResult {
  message: string
  code: string
  messageId: string
}

interface MessagingSendError {
  message: string
  code: string
  errors: Record<any, any>
}

/** @internal */
export interface Messaging
  extends DisconnectableClientContract<Messaging, MessagingClientApiEvents>,
    ClientContextContract {
  /** @internal */
  _session: RealtimeClient

  /**
   * Send an outbound SMS or MMS message.
   *
   * @param params - {@link MessagingSendParams}
   *
   * @returns - {@link MessagingSendResult}
   *
   * @example
   *
   * > Send a message.
   *
   * ```js
   * try {
   *   const sendResult = await client.send({
   *     from: '+1xxx',
   *     to: '+1yyy',
   *     body: 'Hello World!'
   *   })
   *   console.log('Message ID: ', sendResult.messageId)
   * } catch (e) {
   *   console.error(e.message)
   * }
   * ```
   */
  send(params: MessagingSendParams): Promise<MessagingSendResult>
}

/** @internal */
class MessagingAPI extends BaseComponent<MessagingClientApiEvents> {
  /** @internal */

  constructor(options: BaseComponentOptions<MessagingClientApiEvents>) {
    super(options)

    this.runWorker('messagingWorker', {
      worker: messagingWorker,
    })
    this._attachListeners('')
  }

  /** @internal */
  protected getEmitterTransforms() {
    return new Map<string | string[], EventTransform>([
      [
        [
          'messaging.state',
          'messaging.receive',
          'message.updated',
          'message.received',
        ],
        {
          type: 'messagingMessage',
          instanceFactory: (payload: any) => {
            return new Message(payload)
          },
          payloadTransform: (payload: any): MessageContract => {
            /** Building a MessageContract to conform with our Proxy API */
            const {
              message_id,
              message_state,
              from_number,
              to_number,
              tag,
              ...rest
            } = payload

            return toExternalJSON<MessageContract>({
              ...rest,
              id: message_id,
              state: message_state,
              from: from_number,
              to: to_number,
            })
          },
        },
      ],
    ])
  }

  async send(params: MessagingSendParams): Promise<any> {
    const { from = '', to = '', ...rest } = params
    const sendParams: InternalMessagingSendParams = {
      ...rest,
      from_number: from,
      to_number: to,
    }

    try {
      const response: any = await this.execute({
        method: 'messaging.send',
        params: sendParams,
      })

      return toExternalJSON<MessagingSendResult>(response)
    } catch (error) {
      this.logger.error('Error sending message', error.jsonrpc)
      throw error.jsonrpc as MessagingSendError
    }
  }
}

/** @internal */
export const createMessagingObject = (
  params: BaseComponentOptions<MessagingClientApiEvents>
): Messaging => {
  const messaging = connect<MessagingClientApiEvents, MessagingAPI, Messaging>({
    store: params.store,
    Component: MessagingAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return messaging
}

export * from './MessagingClient'
export * from './Message'
export type { MessagingMessageState } from '@signalwire/core'
