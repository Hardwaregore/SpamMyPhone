import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKActions,
  MapToPubSubShape,
  CallingCallSendDigitsEvent,
  SDKWorkerHooks,
} from '@signalwire/core'
import type { Call } from '../Call'

const TARGET_STATES: CallingCallSendDigitsEvent['params']['state'][] = [
  'finished',
]

type VoiceCallSendDigitsWorkerOnDone = (args: Call) => void
type VoiceCallSendDigitsWorkerOnFail = (args: { error: Error }) => void

export type VoiceCallSendDigitsWorkerHooks = SDKWorkerHooks<
  VoiceCallSendDigitsWorkerOnDone,
  VoiceCallSendDigitsWorkerOnFail
>

export const voiceCallSendDigitsWorker: SDKWorker<
  Call,
  VoiceCallSendDigitsWorkerHooks
> = function* (options): SagaIterator {
  getLogger().trace('voiceCallSendDigitsWorker started')
  const { channels, onDone, onFail, initialState = {}, instance } = options
  const { swEventChannel } = channels
  const { controlId } = initialState

  if (!controlId) {
    throw new Error('Missing controlId for sendDigits')
  }

  const action: MapToPubSubShape<CallingCallSendDigitsEvent> =
    yield sagaEffects.take(swEventChannel, (action: SDKActions) => {
      if (
        action.type === 'calling.call.send_digits' &&
        TARGET_STATES.includes(action.payload.state)
      ) {
        return action.payload.control_id === controlId
      }
      return false
    })

  if (action.payload.state === 'finished') {
    onDone?.(instance)
  } else {
    const error = new Error(
      `[voiceCallSendDigitsWorker] unhandled state: '${action.payload.state}'`
    )
    if (typeof onFail === 'function') {
      onFail({ error })
    } else {
      throw error
    }
  }

  getLogger().trace('voiceCallSendDigitsWorker ended')
}
