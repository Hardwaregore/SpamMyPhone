import type { SagaIterator } from '@redux-saga/types'
import type { PayloadAction } from './toolkit'
import {
  JSONRPCResponse,
  SessionAuthError,
  SessionAuthStatus,
  SessionEvents,
  JSONRPCMethod,
  BaseConnectionState,
  Authorization,
} from '../utils/interfaces'
import type {
  VideoAPIEventParams,
  InternalVideoAPIEvent,
  ChatAction,
  TaskAction,
  MessagingAction,
  SwEventParams,
  VoiceCallAction,
  VideoManagerAction,
  PubSubEventAction,
} from '../types'
import { SDKRunSaga } from '.'
import { END, MulticastChannel } from '@redux-saga/core'

interface SWComponent {
  id: string
  responses?: Record<string, JSONRPCResponse>
  errors?: Record<
    string,
    { action: PayloadAction<any>; jsonrpc: JSONRPCResponse }
  >
}

export interface WebRTCCall extends SWComponent {
  state?: BaseConnectionState
  remoteSDP?: string
  nodeId?: string
  roomId?: string
  roomSessionId?: string
  memberId?: string
  previewUrl?: string
  byeCause?: string
  byeCauseCode?: number
  redirectDestination?: string
  audioConstraints?: MediaTrackConstraints
  videoConstraints?: MediaTrackConstraints
}

export interface Message extends SWComponent {
  state?: string
}

export type ReduxComponent = WebRTCCall | Message

export interface ComponentState {
  byId: {
    [key: string]: ReduxComponent
  }
}

export interface SessionState {
  protocol: string
  iceServers?: RTCIceServer[]
  authStatus: SessionAuthStatus
  authState?: Authorization
  authError?: SessionAuthError
  authCount: number
}

export interface SDKState {
  components: ComponentState
  session: SessionState
  executeQueue: ExecuteQueueState
}

export interface ExecuteActionParams {
  requestId?: string
  componentId?: string
  method: JSONRPCMethod
  params: Record<string, any>
}

export interface ExecuteQueueState {
  queue: ExecuteActionParams[]
}

export interface CustomSagaParams<T> {
  instance: T
  runSaga: SDKRunSaga
}

export type CustomSaga<T> = (params: CustomSagaParams<T>) => SagaIterator<any>

/**
 * Converts from:
 * { event_type: <value>, params: <value> }
 * into
 * { type: <value>, payload: <value> }
 */
export type MapToPubSubShape<T> = {
  [K in keyof T as K extends 'event_type'
    ? 'type'
    : K extends 'params'
    ? 'payload'
    : never]: T[K]
}

export type PubSubAction =
  | MapToPubSubShape<VideoAPIEventParams | InternalVideoAPIEvent>
  | {
      type: SessionEvents
      payload: Error | undefined
    }
  | VideoManagerAction
  | ChatAction
  | PubSubEventAction
  | TaskAction
  | MessagingAction
  | VoiceCallAction

export type PubSubChannel = MulticastChannel<PubSubAction>
export type SwEventChannel = MulticastChannel<MapToPubSubShape<SwEventParams>>

export type SDKActions = MapToPubSubShape<SwEventParams> | END
