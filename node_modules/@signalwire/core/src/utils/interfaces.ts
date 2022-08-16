import type { SagaIterator } from '@redux-saga/types'
import type { EventEmitter } from '../utils/EventEmitter'
import { BaseSession } from '../BaseSession'
import { SDKStore } from '../redux'
import {
  GLOBAL_VIDEO_EVENTS,
  INTERNAL_GLOBAL_VIDEO_EVENTS,
  PRODUCT_PREFIXES,
} from './constants'
import type {
  CustomSaga,
  PubSubChannel,
  SwEventChannel,
} from '../redux/interfaces'
import type { URL as NodeURL } from 'node:url'
import {
  AllOrNone,
  CallingTransformType,
  ChatJSONRPCMethod,
  ChatTransformType,
  PubSubTransformType,
  MessagingJSONRPCMethod,
  MessagingTransformType,
  VoiceJSONRPCMethod,
  ClientContextMethod,
} from '..'

type JSONRPCParams = Record<string, any>
type JSONRPCResult = Record<string, any>
type JSONRPCError = Record<string, any>

export type VertoMethod =
  | 'verto.invite'
  | 'verto.attach'
  | 'verto.answer'
  | 'verto.info'
  | 'verto.display'
  | 'verto.media'
  | 'verto.event'
  | 'verto.bye'
  | 'verto.punt'
  | 'verto.broadcast'
  | 'verto.subscribe'
  | 'verto.unsubscribe'
  | 'verto.clientReady'
  | 'verto.modify'
  | 'verto.mediaParams'
  | 'verto.prompt'
  | 'jsapi'
  | 'verto.stats'
  | 'verto.ping'
  | 'verto.pong'
  | 'verto.announce'

export type JSONRPCMethod =
  | 'signalwire.connect'
  | 'signalwire.ping'
  | 'signalwire.disconnect'
  | 'signalwire.event'
  | 'signalwire.reauthenticate'
  | 'signalwire.subscribe'
  | 'video.message'
  | RoomMethod
  | VertoMethod
  | ChatJSONRPCMethod
  | MessagingJSONRPCMethod
  | VoiceJSONRPCMethod
  | ClientContextMethod

export type JSONRPCSubscribeMethod = Extract<
  JSONRPCMethod,
  'signalwire.subscribe' | 'chat.subscribe'
>

export interface JSONRPCRequest {
  jsonrpc: '2.0'
  id: string
  method: JSONRPCMethod
  params?: JSONRPCParams
}

export interface JSONRPCResponse {
  jsonrpc: '2.0'
  id: string
  result?: JSONRPCResult
  error?: JSONRPCError
}

export interface BaseRPCResult extends Record<string, unknown> {
  code: string
  message: string
}

export interface SessionOptions {
  /** @internal */
  host?: string
  /** SignalWire project id, e.g. `a10d8a9f-2166-4e82-56ff-118bc3a4840f` */
  project?: string
  /** SignalWire project token, e.g. `PT9e5660c101cd140a1c93a0197640a369cf5f16975a0079c9` */
  token: string
  /** SignalWire contexts, e.g. 'home', 'office'.. */
  contexts?: string[]
  // From `LogLevelDesc` of loglevel to simplify our docs
  /** logging level */
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'
  /**
   * The SDK invokes this method and uses the new token to re-auth.
   * TODO: rename it: getNewToken, getRefreshedToken, fetchToken (?)
   *
   * @internal
   * */
  _onRefreshToken?(): void
}
export interface UserOptions extends SessionOptions {
  /** @internal */
  devTools?: boolean
  /** @internal */
  debug?: {
    logWsTraffic?: boolean
  }
  /** @internal */
  logger?: SDKLogger
}

export interface InternalUserOptions extends UserOptions {
  /**
   * TODO: Create type containing all the possible types the
   * emitter should be allowed to handle
   */
  emitter: EventEmitter<any>
  workers?: SDKWorker<any>[]
}

/**
 * `UserOptions` is exposed to the end user and `BaseClientOptions` is
 * the interface we use internally that extends the options provided.
 * @internal
 */
export interface BaseClientOptions<
  // TODO: review if having a default makes sense.
  EventTypes extends EventEmitter.ValidEventTypes = any
> extends UserOptions {
  store: SDKStore
  emitter: EventEmitter<EventTypes>
}

export interface BaseComponentOptions<
  EventTypes extends EventEmitter.ValidEventTypes
> {
  store: SDKStore
  emitter: EventEmitter<EventTypes>
  customSagas?: CustomSaga<any>[]
}

export interface SessionRequestObject {
  rpcRequest: JSONRPCRequest
  resolve: (value: unknown) => void
  reject: (value: unknown) => void
}

export type MediaAllowed = 'all' | 'audio-only' | 'video-only'
export type MediaDirectionAllowed = 'none' | 'receive' | 'both'
export type AudioAllowed = MediaDirectionAllowed
export type VideoAllowed = MediaDirectionAllowed

export interface Authorization {
  type: 'video'
  project: string
  scopes: string[]
  scope_id: string
  resource: string
  user_name: string
  room?: {
    name: string
    scopes: string[]
  }
  signature: string
  expires_at?: number
  media_allowed: MediaAllowed
  audio_allowed: AudioAllowed
  video_allowed: VideoAllowed
}

export interface RPCConnectResult {
  identity: string
  authorization: Authorization
  protocol: string
  ice_servers?: RTCIceServer[]
}

export type SessionConstructor = typeof BaseSession

export type SessionAuthStatus =
  | 'unknown'
  | 'authorizing'
  | 'authorized'
  | 'unauthorized'

export type SessionStatus =
  | 'unknown'
  | 'idle'
  | 'reconnecting'
  | 'connected'
  | 'disconnected'
  | 'auth_error'
  | 'expiring'

export type SessionEvents = `session.${SessionStatus}`

export type CompoundEvents = 'compound_event:attach'

/**
 * List of all the events the client can listen to.
 * @internal
 */
export type ClientEvents = Record<SessionEvents, () => void>

export type BaseConnectionState =
  | 'active'
  | 'answering'
  | 'destroy'
  | 'early'
  | 'hangup'
  | 'held'
  | 'new'
  | 'purge'
  | 'recovering'
  | 'requesting'
  | 'ringing'
  | 'trying'

export type SessionAuthError = {
  code: number
  message: string
}

/**
 * List of all Room methods
 */
export type RoomMethod =
  | 'video.room.get'
  | 'video.rooms.get'
  | 'video.list_available_layouts'
  | 'video.hide_video_muted'
  | 'video.show_video_muted'
  | 'video.members.get'
  | 'video.member.audio_mute'
  | 'video.member.audio_unmute'
  | 'video.member.video_mute'
  | 'video.member.video_unmute'
  | 'video.member.deaf'
  | 'video.member.undeaf'
  | 'video.member.set_input_volume'
  | 'video.member.set_output_volume'
  | 'video.member.set_input_sensitivity'
  | 'video.member.set_position'
  | 'video.member.remove'
  | 'video.member.set_meta'
  | 'video.set_meta'
  | 'video.set_layout'
  | 'video.set_position'
  | 'video.recording.list'
  | 'video.recording.start'
  | 'video.recording.stop'
  | 'video.recording.pause'
  | 'video.recording.resume'
  | 'video.playback.list'
  | 'video.playback.start'
  | 'video.playback.pause'
  | 'video.playback.resume'
  | 'video.playback.stop'
  | 'video.playback.set_volume'
  | 'video.playback.seek_absolute'
  | 'video.playback.seek_relative'

export interface WebSocketClient {
  addEventListener: WebSocket['addEventListener']
  removeEventListener: WebSocket['addEventListener']
  send: WebSocket['send']
  close: WebSocket['close']
  readyState: WebSocket['readyState']
}

interface NodeSocketClient extends WebSocketClient {
  addEventListener(
    method: 'open' | 'close' | 'error' | 'message',
    cb: (event: any) => void,
    options?: any
  ): void
  removeEventListener(
    method: 'open' | 'close' | 'error' | 'message',
    cb: (event: any) => void
  ): void
}

/**
 * There's a difference in `searchParams` between URL from
 * `lib` and URL from `url` (node) that makes using the same
 * not possible for us.
 */
export interface NodeSocketAdapter {
  new (address: string | NodeURL, options?: any): NodeSocketClient
  new (
    address: string | NodeURL,
    protocols?: string | string[],
    options?: any
  ): NodeSocketClient
}
export interface WebSocketAdapter {
  new (url: string | URL, protocols?: string | string[]): WebSocketClient
}

export type ExecuteParams = {
  method: JSONRPCMethod
  params: Record<string, any>
}

export interface ExecuteExtendedOptions<InputType, OutputType, ParamsType> {
  /** To transform the resolved response */
  transformResolve?: ExecuteTransform<InputType, OutputType>
  /** To transform the rejected response */
  transformReject?: ExecuteTransform<InputType, OutputType>
  /** To transform the RPC execute params */
  transformParams?: ExecuteTransform<ParamsType, ExecuteParams['params']>
}

export type ExecuteTransform<InputType = unknown, OutputType = unknown> = (
  payload: InputType
) => OutputType

export type APIMethodsMap<T> = {
  [k in keyof T]: PropertyDescriptor
}

export type RoomCustomMethods<T> = APIMethodsMap<T>

export type EventsPrefix = '' | typeof PRODUCT_PREFIXES[number]
/**
 * See {@link GLOBAL_VIDEO_EVENTS} for the full list of events.
 */
export type GlobalVideoEvents = typeof GLOBAL_VIDEO_EVENTS[number]
export type InternalGlobalVideoEvents =
  typeof INTERNAL_GLOBAL_VIDEO_EVENTS[number]

/**
 * NOTE: `EventTransformType` is not tied to a constructor but more on
 * the event payloads.
 * We are using `roomSession` and `roomSessionSubscribed` here because
 * some "Room" events have similar payloads while `room.subscribed` has
 * nested fields the SDK has to process.
 * `EventTransformType` identifies a unique `EventTransform` type based on the
 * payload it has to process.
 */
export type EventTransformType =
  | 'roomSession'
  | 'roomSessionSubscribed'
  | 'roomSessionMember'
  | 'roomSessionLayout'
  | 'roomSessionRecording'
  | 'roomSessionPlayback'
  | ChatTransformType
  | PubSubTransformType
  | MessagingTransformType
  | CallingTransformType

export interface NestedFieldToProcess {
  /**
   * Allow us to update the nested `payload` to match the shape we already
   * treat consuming other events from the server.
   * For example: wrapping the `payload` within a specific key.
   *  `payload` becomes `{ "member": payload }`
   */
  processInstancePayload: (payload: any) => any
  /** Type of the EventTransform to select from `instance._emitterTransforms` */
  eventTransformType: EventTransformType
}

/**
 * `EventTransform`s represent our internal pipeline for
 * creating specific instances for each event handler. This
 * is basically what let us create and pass a `Member`
 * object for the `member.x` event handler.
 *
 * Each class extending from `BaseComponent` has the ability
 * to define a `getEmitterTransforms` method. That method
 * will let us specify a set of methods (defined by the
 * `EventTransform` interface) for defining how we want to
 * handle certain events.
 *
 * Internally, the pipeline looks as follows:
 * 1. We create and cache the instance using
 *    `instanceFactory`. You could think of this object as a
 *    set of methods with no state. It's important to note
 *    that `instanceFactory` **must** return an stateless
 *    object. If for some reason you have to have some state
 *    on the instance make sure those values are static.
 * 2. Every time we get an event from the server, we grab
 *    its payload, and combine the stateless object we
 *    created with `instanceFactory` with that payload
 *    (through a Proxy) to create a unique **stateful**
 *    object. This will be the instance the end user will be
 *    interacting with.
 *
 * The easiest way to think about this is that the payload
 * sent by the server is our **state**, while the object
 * created using `instanceFactory` is the **behavior**.
 *
 * Proxy
 * ┌───────────────────────────────────┐
 * │┼─────────────────────────────────┼│
 * ││            payload              ││
 * │┼─────────────────────────────────┼│
 * │┼─────────────────────────────────┼│
 * ││   object (from instanceFactory) ││
 * │┼─────────────────────────────────┼│
 * └───────────────────────────────────┘
 */
export interface EventTransform {
  /**
   * Using the `key` we can cache and retrieve a single instance
   * for the **stateless** object returned by `instanceFactory`
   */
  type: EventTransformType
  /**
   * Must return an **stateless** object. Think of it as a
   * set of APIs representing the behavior you want to
   * expose to the end user.
   */
  instanceFactory: (payload: any) => any
  /**
   * Allow us to transform the payload sent by the server.
   *
   * It's important to note that the `payload` **is your
   * only state**, so if you try to access something using
   * `this` you'll get only to static properties or methods
   * defined by the object returned from `instanceFactory`.
   */
  payloadTransform: (payload: any) => any
  /**
   * For some events we need to transform not only the top-level
   * payload but also different nested fields.
   * This allow us to target the fields and apply transform those
   * into stateless object following our EventTranform pattern.
   */
  nestedFieldsToProcess?: Record<string, NestedFieldToProcess>
  /**
   * Allow us to define what property to use to namespace
   * our events (_eventsNamespace).
   */
  getInstanceEventNamespace?: (payload: any) => string
  /**
   * Allow us to define the `event_channel` for the Proxy.
   */
  getInstanceEventChannel?: (payload: any) => string
  /**
   * Determines if the instance created by `instanceFactory`
   * should be cached per event. This is the instance that
   * will be passed to our event handlers
   */
  mode?: 'cache' | 'no-cache'
}

export type BaseEventHandler = (...args: any[]) => void

export type InternalChannels = {
  pubSubChannel: PubSubChannel
  swEventChannel: SwEventChannel
}

export type SDKWorkerHooks<
  OnDone = (options?: any) => void,
  OnFail = (options?: any) => void
> = AllOrNone<{
  onDone: OnDone
  onFail: OnFail
}>

type SDKWorkerBaseParams<T> = {
  channels: InternalChannels
  instance: T
  runSaga: any
  /**
   * TODO: rename `payload` with something more explicit or
   * create derived types of `SDKWorkerParams` with specific arguments (?)
   * @deprecated use `initialState`
   */
  payload?: any
  initialState?: any
}

export type SDKWorkerParams<
  T,
  Hooks extends SDKWorkerHooks = SDKWorkerHooks
> = SDKWorkerBaseParams<T> & Hooks

export type SDKWorker<T, Hooks extends SDKWorkerHooks = SDKWorkerHooks> = (
  params: SDKWorkerParams<T, Hooks>
) => SagaIterator<any>

export type SDKWorkerDefinition<Hooks extends SDKWorkerHooks = SDKWorkerHooks> =
  {
    worker: SDKWorker<any>
    initialState?: any
  } & Hooks

interface LogFn {
  <T extends object>(obj: T, msg?: string, ...args: any[]): void
  (obj: unknown, msg?: string, ...args: any[]): void
  (msg: string, ...args: any[]): void
}
export interface SDKLogger {
  fatal: LogFn
  error: LogFn
  warn: LogFn
  info: LogFn
  debug: LogFn
  trace: LogFn
}

export interface WsTrafficOptions {
  type: 'send' | 'recv'
  payload: JSONRPCResponse | JSONRPCRequest
}

export interface InternalSDKLogger extends SDKLogger {
  wsTraffic: (options: WsTrafficOptions) => void
}
