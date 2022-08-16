import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKActions,
  MapToPubSubShape,
  CallingCallDialEvent,
  SDKWorkerHooks,
  ToExternalJSONResult,
  CallingCallDialFailedEventParams,
  toExternalJSON,
} from '@signalwire/core'
import type { Call } from '../Call'

const TARGET_DIAL_STATES: CallingCallDialEvent['params']['dial_state'][] = [
  'answered',
  'failed',
]

type VoiceCallDialWorkerOnDone = (args: Call) => void
type VoiceCallDialWorkerOnFail = (
  args: ToExternalJSONResult<CallingCallDialFailedEventParams>
) => void

export type VoiceCallDialWorkerHooks = SDKWorkerHooks<
  VoiceCallDialWorkerOnDone,
  VoiceCallDialWorkerOnFail
>

export const voiceCallDialWorker: SDKWorker<Call, VoiceCallDialWorkerHooks> =
  function* (options): SagaIterator {
    const { channels, instance, onDone, onFail } = options
    const { swEventChannel } = channels
    getLogger().trace('voiceCallDialWorker started')

    const action: MapToPubSubShape<CallingCallDialEvent> =
      yield sagaEffects.take(swEventChannel, (action: SDKActions) => {
        if (
          action.type === 'calling.call.dial' &&
          TARGET_DIAL_STATES.includes(action.payload.dial_state)
        ) {
          return instance.tag === action.payload.tag
        }
        return false
      })

    if (action.payload.dial_state === 'answered') {
      onDone?.(instance)
    } else if (action.payload.dial_state === 'failed') {
      onFail?.(toExternalJSON(action.payload))
    } else {
      throw new Error('[voiceCallDialWorker] unhandled call_state')
    }

    getLogger().trace('voiceCallDialWorker ended')
  }
