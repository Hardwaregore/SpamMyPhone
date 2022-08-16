import { createAction, Action } from './toolkit'
import {
  JSONRPCRequest,
  SessionAuthError,
  SessionEvents,
  CompoundEvents,
} from '../utils/interfaces'
import { ExecuteActionParams } from './interfaces'
import { EventEmitter } from '..'

export const initAction = createAction('swSdk/init')
export const destroyAction = createAction('swSdk/destroy')
export const closeConnectionAction = createAction('swSdk/closeConnection')
/**
 * Used to trigger a `signalwire.reauthenticate`
 */
export const reauthAction = createAction<{ token: string }>('swSdk/reauth')

/**
 * Trigger saga to send a JSONRPC over the wire
 */
export const executeAction = createAction<ExecuteActionParams>(
  'swSdk/executeRequest'
)

export const authErrorAction =
  createAction<{ error: SessionAuthError }>('auth/error')
export const authSuccessAction = createAction('auth/success')
export const authExpiringAction = createAction('auth/expiring')

export const socketClosedAction = createAction('socket/closed')
export const socketErrorAction = createAction('socket/error')
export const socketMessageAction = createAction<JSONRPCRequest, string>(
  'socket/message'
)

// TODO: define if we need/want to send a payload with these events.
export const sessionConnectedAction = createAction<void, SessionEvents>(
  'session.connected'
)
export const sessionDisconnectedAction = createAction<void, SessionEvents>(
  'session.disconnected'
)
export const sessionReconnectingAction = createAction<void, SessionEvents>(
  'session.reconnecting'
)
export const sessionAuthErrorAction = createAction<Error, SessionEvents>(
  'session.auth_error'
)
export const sessionExpiringAction = createAction<void, SessionEvents>(
  'session.expiring'
)
const formatCustomSagaAction = (id: string, action: Action) => {
  return `${action.type}/${id}`
}

export const makeCustomSagaAction = (id: string, action: Action) => {
  return {
    ...action,
    type: formatCustomSagaAction(id, action),
  }
}

export const getCustomSagaActionType = (id: string, action: Action) => {
  return formatCustomSagaAction(id, action)
}

export const compoundEventAttachAction = createAction<
  {
    compoundEvents: EventEmitter.EventNames<EventEmitter.ValidEventTypes>[]
    event: EventEmitter.EventNames<EventEmitter.ValidEventTypes>
    namespace?: string
  },
  CompoundEvents
>('compound_event:attach')

export { createAction }
