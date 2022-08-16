import {
  BaseComponentOptions,
  BaseConsumer,
  connect,
  JSONRPCSubscribeMethod,
  ExecuteParams,
  actions,
  SessionEvents,
  EventEmitter,
  EventTransform,
  toExternalJSON,
} from '..'
import type {
  PubSubChannel,
  InternalPubSubChannel,
  PubSubEventNames,
  PubSubPublishParams,
  PubSubMessageEventName,
  PubSubChannelMessageEvent,
} from '../types/pubSub'
import { PRODUCT_PREFIX_PUBSUB } from '../utils/constants'
import { PubSubMessage } from './PubSubMessage'
import * as workers from './workers'

export type BasePubSubApiEventsHandlerMapping = Record<
  PubSubMessageEventName,
  (message: PubSubMessage) => void
> &
  Record<Extract<SessionEvents, 'session.expiring'>, () => void>

/**
 * @privateRemarks
 *
 * Each package will have the option to either extend this
 * type or provide their own event mapping.
 */
export type BasePubSubApiEvents<T = BasePubSubApiEventsHandlerMapping> = {
  [k in keyof T]: T[k]
}

const toInternalPubSubChannels = (
  channels: string[]
): InternalPubSubChannel[] => {
  return channels.map((name) => {
    return {
      name,
    }
  })
}

export class BasePubSubConsumer<
  EventTypes extends EventEmitter.ValidEventTypes = BasePubSubApiEvents
> extends BaseConsumer<EventTypes> {
  protected override _eventsPrefix = PRODUCT_PREFIX_PUBSUB
  protected override subscribeMethod: JSONRPCSubscribeMethod = `${PRODUCT_PREFIX_PUBSUB}.subscribe`

  constructor(options: BaseComponentOptions<EventTypes>) {
    super(options)

    /**
     * Since we don't need a namespace for these events
     * we'll attach them as soon as the Client has been
     * registered in the Redux store.
     */
    this._attachListeners('')

    this.runWorker('pubSub', { worker: workers.pubSubWorker })
  }

  /** @internal */
  protected getEmitterTransforms() {
    return new Map<any, EventTransform>([
      [
        ['message'],
        {
          type: 'pubSubMessage',
          instanceFactory: () => {
            return new PubSubMessage({} as any)
          },
          payloadTransform: (payload: PubSubChannelMessageEvent) => {
            const {
              channel,
              /**
               * Since we're using the same event as `Chat`
               * the payload comes with a `member` prop. To
               * avoid confusion (since `PubSub` doesn't
               * have members) we'll remove it from the
               * payload sent to the end user.
               */
              // @ts-expect-error
              message: { member, ...restMessage },
            } = payload.params
            return toExternalJSON({
              ...restMessage,
              channel,
            })
          },
        },
      ],
    ])
  }

  private _getChannelsParam(
    channels: string | string[] | undefined,
    method: 'subscribe' | 'unsubscribe'
  ) {
    const _channels =
      !channels || Array.isArray(channels) ? channels : [channels]

    if (!Array.isArray(_channels) || _channels.length === 0) {
      throw new Error(
        `Please specify one or more channels when calling .${method}()`
      )
    }

    return {
      channels: toInternalPubSubChannels(_channels),
    }
  }

  /** @internal */
  protected _setSubscribeParams(params: Record<string, any>) {
    this.subscribeParams = {
      ...this.subscribeParams,
      ...params,
    }
  }

  /** @internal */
  protected _getSubscribeParams({ channels }: { channels?: PubSubChannel }) {
    return {
      ...this._getChannelsParam(channels, 'subscribe'),
    }
  }

  /** @internal */
  protected _getUnsubscribeParams({ channels }: { channels?: PubSubChannel }) {
    const channelsParam = this._getChannelsParam(channels, 'unsubscribe')

    return {
      ...channelsParam,
    }
  }

  private _checkMissingSubscriptions() {
    const subscriptions = this.getSubscriptions()
    if (subscriptions.length === 0) {
      this.logger.info(
        'Subscribe was called before any listeners were attached. Move `.subscribe()` right after your event listeners to suppress this message.'
      )
      // @ts-ignore
      this.once('message', () => {})
    }
  }

  async subscribe(channels?: PubSubChannel) {
    this._checkMissingSubscriptions()

    const params = this._getSubscribeParams({ channels })

    this._setSubscribeParams(params)

    return super.subscribe()
  }

  async unsubscribe(channels: PubSubChannel): Promise<void> {
    if (
      this._sessionAuthStatus === 'unknown' ||
      this._sessionAuthStatus === 'unauthorized'
    ) {
      throw new Error('You must be authenticated to unsubscribe from a channel')
    }

    const params = this._getUnsubscribeParams({ channels })

    return new Promise(async (resolve, reject) => {
      const subscriptions = this.getSubscriptions()

      if (subscriptions.length > 0) {
        const execParams: ExecuteParams = {
          method: `${PRODUCT_PREFIX_PUBSUB}.unsubscribe`,
          params: {
            ...params,
            events: subscriptions,
          },
        }

        try {
          await this.execute(execParams)
        } catch (error) {
          return reject(error)
        }
      } else {
        this.logger.warn(
          '`unsubscribe()` was called without any listeners attached.'
        )
      }

      return resolve()
    })
  }

  updateToken(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // @ts-expect-error
      this.once('session.auth_error', (error) => {
        reject(error)
      })
      // @ts-expect-error
      this.once('session.connected', () => {
        resolve()
      })

      this.store.dispatch(actions.reauthAction({ token }))
    })
  }

  publish(params: PubSubPublishParams) {
    return this.execute({
      method: `${PRODUCT_PREFIX_PUBSUB}.publish`,
      params,
    })
  }
}

export const createBasePubSubObject = <PubSubType>(
  params: BaseComponentOptions<PubSubEventNames>
) => {
  const pubSub = connect<BasePubSubApiEvents, BasePubSubConsumer, PubSubType>({
    store: params.store,
    Component: BasePubSubConsumer,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return pubSub
}
