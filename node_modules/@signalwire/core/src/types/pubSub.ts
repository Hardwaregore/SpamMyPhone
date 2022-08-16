import type {
  OnlyStateProperties,
  OnlyFunctionProperties,
  CamelToSnakeCase,
  SwEvent,
  MapToPubSubShape,
} from '..'
import { PRODUCT_PREFIX_PUBSUB } from '../utils/constants'

type ToInternalPubSubEvent<T extends string> = `${PubSubNamespace}.${T}`
export type PubSubNamespace = typeof PRODUCT_PREFIX_PUBSUB

export type PubSubMessageEventName = 'message'

export type PubSubEventNames = PubSubMessageEventName

export type PubSubChannel = string | string[]

export interface PubSubPublishParams {
  content: any
  channel: string
  meta?: Record<any, any>
}

export interface PubSubContract {
  /**
   * Replaces the token used by the client with a new one.
   * You can use this method to replace the token when for
   * example it is expiring, in order to keep the session
   * alive.
   */
  updateToken(token: string): Promise<void>
  /**
   * List of channels for which you want to receive messages.
   *
   * Note that the `subscribe` function is idempotent, and calling it again with
   * a different set of channels _will not_ unsubscribe you from the old ones.
   * To unsubscribe, use {@link unsubscribe}.
   *
   * @param channels - {@link PubSubChannel}
   *
   * @example
   * ```js
   * await pubSubClient.subscribe("my-channel")
   * await pubSubClient.subscribe(["chan-2", "chan-3"])
   * ```
   */
  subscribe(channels: PubSubChannel): Promise<void>
  /**
   * List of channels from which you want to unsubscribe.
   *
   * @param channels - {@link PubSubChannel}
   *
   * @example
   * ```js
   * await pubSubClient.unsubscribe("my-channel")
   * await pubSubClient.unsubscribe(["chan-2", "chan-3"])
   * ```
   */
  unsubscribe(channels: PubSubChannel): Promise<void>
  /**
   * Publish a message into the specified channel.
   *
   * @param params - {@link PubSubPublishParams}
   *
   * @example Publishing a message as a string:
   * ```js
   * await pubSubClient.publish({
   *   channel: 'my-channel',
   *   content: 'Hello, world.'
   * })
   * ```
   *
   * @example Publishing a message as an object:
   * ```js
   * await pubSubClient.publish({
   *   channel: 'my-channel',
   *   content: {
   *     field_one: 'value_one',
   *     field_two: 'value_two',
   *   }
   * })
   * ```
   */
  publish(params: PubSubPublishParams): Promise<void>
}

export type PubSubEntity = OnlyStateProperties<PubSubContract>
export type PubSubMethods = Omit<
  OnlyFunctionProperties<PubSubContract>,
  'subscribe' | 'unsubscribe' | 'updateToken'
>

export interface PubSubMessageContract {
  id: string
  channel: string
  content: any
  publishedAt: Date
  meta?: any
}

export type PubSubMessageEntity = OnlyStateProperties<PubSubMessageContract>

export type InternalPubSubMessageEntity = {
  [K in NonNullable<
    keyof PubSubMessageEntity
  > as CamelToSnakeCase<K>]: PubSubMessageEntity[K]
}

/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */

/**
 * Internally we're mapping/converting this event to
 * `message` so the end user can register their event
 * handlers as `client.on('message', handler)` instead of
 * `client.on('channel.message', handler)`
 */
type ChannelMessageEventName = 'channel.message'

/**
 * 'chat.channel.message'
 */
export interface PubSubChannelMessageEventParams {
  channel: string
  message: InternalPubSubMessageEntity
}

export interface PubSubChannelMessageEvent extends SwEvent {
  event_type: ToInternalPubSubEvent<ChannelMessageEventName>
  params: PubSubChannelMessageEventParams
}

export type PubSubEvent = PubSubChannelMessageEvent

export type PubSubEventParams = PubSubChannelMessageEventParams

export type PubSubEventAction = MapToPubSubShape<PubSubEvent>

export interface InternalPubSubChannel {
  name: string
}

export type PubSubJSONRPCMethod =
  | `${typeof PRODUCT_PREFIX_PUBSUB}.subscribe`
  | `${typeof PRODUCT_PREFIX_PUBSUB}.publish`
  | `${typeof PRODUCT_PREFIX_PUBSUB}.unsubscribe`

export type PubSubTransformType = 'pubSubMessage'
