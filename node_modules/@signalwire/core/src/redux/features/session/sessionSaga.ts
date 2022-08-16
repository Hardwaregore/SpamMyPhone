import { SagaIterator, eventChannel, EventChannel } from '@redux-saga/core'
import {
  call,
  put,
  take,
  fork,
  select,
  cancelled,
} from '@redux-saga/core/effects'
import type { PayloadAction } from '../../toolkit'
import { BaseSession } from '../../../BaseSession'
import { VertoResult, VertoPong } from '../../../RPCMessages'
import { JSONRPCRequest, JSONRPCResponse } from '../../../utils/interfaces'
import type {
  VideoAPIEventParams,
  SwEventParams,
  WebRTCMessageParams,
  MemberTalkingEventNames,
} from '../../../types'
import type {
  ExecuteActionParams,
  WebRTCCall,
  PubSubChannel,
  SwEventChannel,
} from '../../interfaces'
import { createCatchableSaga } from '../../utils/sagaHelpers'
import { executeAction, socketMessageAction } from '../../actions'
import { componentActions } from '../'
import { RPCExecute } from '../../../RPCMessages'
import { getLogger, toInternalAction } from '../../../utils'
import { getAuthStatus } from '../session/sessionSelectors'
import { getComponent } from '../component/componentSelectors'
import { SessionAuthStatus } from '../../../utils/interfaces'

type SessionSagaParams = {
  session: BaseSession
  sessionChannel: EventChannel<unknown>
  pubSubChannel: PubSubChannel
  swEventChannel: SwEventChannel
}

type VertoWorkerParams = {
  jsonrpc: JSONRPCRequest
  nodeId: string
}

// TODO: Move TypeGuards to its own module
const isWebrtcEvent = (e: SwEventParams): e is WebRTCMessageParams => {
  return e?.event_type === 'webrtc.message'
}
const isVideoEvent = (e: SwEventParams): e is VideoAPIEventParams => {
  return !!e?.event_type?.startsWith('video.')
}

/**
 * Watch every "executeAction" and fork the worker to send
 * a JSONRPC over the wire and then update the state
 * with "componentActions.executeSuccess" or "componentActions.executeFailure"
 * actions if a componentId is provided.
 */
export function* executeActionWatcher(session: BaseSession): SagaIterator {
  function* worker(action: PayloadAction<ExecuteActionParams>): SagaIterator {
    const authStatus: SessionAuthStatus = yield select(getAuthStatus)

    /**
     * Just a safety-guard since this code shouldn't be
     * executed when the session is not authorized.
     */
    if (authStatus !== 'authorized') {
      return
    }

    const { componentId, requestId, method, params } = action.payload
    try {
      const message = RPCExecute({
        id: requestId,
        method,
        params,
      })
      const response = yield call(session.execute, message)
      if (componentId && requestId) {
        yield put(
          componentActions.executeSuccess({
            componentId,
            requestId,
            response,
          })
        )
      }
    } catch (error) {
      getLogger().warn('worker error', componentId, JSON.stringify(error))
      if (componentId && requestId) {
        yield put(
          componentActions.executeFailure({
            componentId,
            requestId,
            action,
            error,
          })
        )
      }
    } finally {
      const isCancelled = yield cancelled()

      if (isCancelled && componentId && requestId) {
        const error: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            // Invalid Request
            code: -32600,
            message: 'Cancelled task',
          },
        }
        getLogger().debug('executeActionWorker cancelled', {
          requestId,
          componentId,
          error,
        })
        yield put(
          componentActions.executeFailure({
            componentId,
            requestId,
            action,
            error,
          })
        )
      }
    }
  }

  while (true) {
    const action = yield take(executeAction.type)
    yield fork(worker, action)
  }
}

export function* sessionChannelWatcher({
  session,
  sessionChannel,
  pubSubChannel,
  swEventChannel,
}: SessionSagaParams): SagaIterator {
  function* vertoWorker({ jsonrpc, nodeId }: VertoWorkerParams) {
    const { id, method, params = {} } = jsonrpc

    switch (method) {
      case 'verto.media': {
        const component = {
          id: params.callID,
          state: 'early',
          remoteSDP: params.sdp,
          nodeId,
        }
        yield put(componentActions.upsert(component))
        yield put(
          executeAction({
            method: 'video.message',
            params: {
              message: VertoResult(id, method),
              node_id: nodeId,
            },
          })
        )
        break
      }
      case 'verto.answer': {
        const component: WebRTCCall = {
          id: params.callID,
          state: 'active',
          nodeId,
        }
        if (params?.sdp) {
          component.remoteSDP = params.sdp
        }
        yield put(componentActions.upsert(component))
        yield put(
          executeAction({
            method: 'video.message',
            params: {
              message: VertoResult(id, method),
              node_id: nodeId,
            },
          })
        )
        break
      }
      case 'verto.bye': {
        const component: WebRTCCall = {
          id: params.callID,
          state: 'hangup',
          nodeId,
          byeCause: params?.cause ?? '',
          byeCauseCode: params?.causeCode ?? 0,
          redirectDestination: params?.redirectDestination,
        }
        yield put(componentActions.upsert(component))
        yield put(
          executeAction({
            method: 'video.message',
            params: {
              message: VertoResult(id, method),
              node_id: nodeId,
            },
          })
        )
        break
      }
      case 'verto.ping': {
        yield put(
          executeAction({
            method: 'video.message',
            params: {
              message: VertoPong(params),
              node_id: nodeId,
            },
          })
        )
        break
      }
      case 'verto.punt':
        return session.disconnect()
      case 'verto.mediaParams': {
        const { callID, mediaParams = {} } = params
        if (!callID) {
          getLogger().debug(`Invalid mediaParams event`, params)
          break
        }
        const component: WebRTCCall = { id: callID }
        if (mediaParams?.video) {
          component.videoConstraints = mediaParams.video
        }
        if (mediaParams?.audio) {
          component.audioConstraints = mediaParams.audio
        }
        yield put(componentActions.upsert(component))
        break
      }
      // case 'verto.invite':
      //   break
      // case 'verto.attach':
      //   break
      case 'verto.info':
        return getLogger().debug('Verto Info', params)
      case 'verto.clientReady':
        return getLogger().debug('Verto ClientReady', params)
      case 'verto.announce':
        return getLogger().debug('Verto Announce', params)
      default:
        return getLogger().debug(`Unknown Verto method: ${method}`, params)
    }
  }

  function* videoAPIWorker(params: VideoAPIEventParams): SagaIterator {
    switch (params.event_type) {
      case 'video.member.updated': {
        /**
         * `video.member.updated` is handled by the
         * layoutWorker so to avoid dispatching the event
         * twice (or with incomplete data) we'll early
         * return.
         */
        return
      }
      case 'video.room.subscribed': {
        yield put(
          componentActions.upsert({
            id: params.params.call_id,
            roomId: params.params.room_session.room_id,
            roomSessionId: params.params.room_session.id,
            memberId: params.params.member_id,
            previewUrl: params.params.room_session.preview_url,
          })
        )
        // Rename "room.subscribed" with "room.joined" for the end-user
        yield put(pubSubChannel, {
          type: 'video.room.joined',
          payload: params.params,
        })
        break
      }
      case 'video.member.joined': {
        /**
         * On video.member.joined with a parent_id, check if we are the
         * owner of the object comparing parent_id in the state.
         * If so update the state with the room values to update the
         * object (= trigger `onRoomSubscribed`).
         */
        const { member } = params.params
        if (member?.parent_id) {
          const parent = yield select(getComponent, member.parent_id)
          if (parent) {
            yield put(
              componentActions.upsert({
                id: member.id,
                roomId: params.params.room_id,
                roomSessionId: params.params.room_session_id,
                memberId: member.id,
              })
            )
          }
        }
        break
      }
      case 'video.member.talking': {
        const { member } = params.params
        if ('talking' in member) {
          const suffix = member.talking ? 'started' : 'ended'
          yield put(pubSubChannel, {
            type: `video.member.talking.${suffix}` as MemberTalkingEventNames,
            payload: params.params,
          })
          // Keep for backwards compat.
          const deprecatedSuffix = member.talking ? 'start' : 'stop'
          yield put(pubSubChannel, {
            type: `video.member.talking.${deprecatedSuffix}` as MemberTalkingEventNames,
            payload: params.params,
          })
        }
        break
      }
    }

    // Emit on the pubSubChannel this "event_type"
    yield put(pubSubChannel, {
      type: params.event_type,
      // @ts-expect-error
      payload: params.params,
    })
  }

  function* swEventWorker(broadcastParams: SwEventParams) {
    yield put(swEventChannel, toInternalAction(broadcastParams))

    if (isWebrtcEvent(broadcastParams)) {
      yield fork(vertoWorker, {
        jsonrpc: broadcastParams.params,
        nodeId: broadcastParams.node_id,
      })
      return
    }
    if (isVideoEvent(broadcastParams)) {
      yield fork(videoAPIWorker, broadcastParams)
      return
    }

    /**
     * Put actions with `event_type` to trigger all the children sagas
     * This should replace all the isWebrtcEvent/isVideoEvent guards below
     * since we'll move that logic on a separate package.
     */
    yield put({ type: broadcastParams.event_type, payload: broadcastParams })
  }

  function* sessionChannelWorker(
    action: PayloadAction<JSONRPCRequest>
  ): SagaIterator {
    if (action.type !== socketMessageAction.type) {
      yield put(action)
      return
    }
    const { method, params } = action.payload

    switch (method) {
      case 'signalwire.event':
        yield fork(swEventWorker, params as SwEventParams)
        break
      default:
        return getLogger().debug(`Unknown message: ${method}`, action)
    }
  }
  const sessionChannelWorkerCatchable = createCatchableSaga<
    PayloadAction<JSONRPCRequest>
  >(sessionChannelWorker, (error) => {
    getLogger().error('Channel Error', error)
  })

  /**
   * Make the watcher restartable
   */
  while (true) {
    try {
      while (true) {
        const action = yield take(sessionChannel)
        yield fork(sessionChannelWorkerCatchable, action)
      }
    } catch (error) {
      getLogger().error('sessionChannelWorker error:', error)
    } finally {
      getLogger().debug('sessionChannelWorker finally')
    }
  }
}

export function createSessionChannel(session: BaseSession) {
  return eventChannel((emit) => {
    session.dispatch = (payload: PayloadAction<any>) => {
      emit(payload)
    }

    // this will be invoked when the saga calls `channel.close()` method
    const unsubscribe = () => {
      getLogger().debug('sessionChannel unsubscribe')
      session.disconnect()
    }

    return unsubscribe
  })
}
