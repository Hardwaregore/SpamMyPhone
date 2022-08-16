import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKActions,
  CallingCallStateEvent,
  MapToPubSubShape,
} from '@signalwire/core'
import type { Call } from '../Call'

export const voiceCallStateWorker: SDKWorker<Call> = function* (
  options
): SagaIterator {
  const { channels, instance } = options
  const { swEventChannel, pubSubChannel } = channels
  getLogger().trace('voiceCallStateWorker started', instance.id, instance.tag)

  let run = true
  const done = () => (run = false)

  while (run) {
    const action: MapToPubSubShape<CallingCallStateEvent> =
      yield sagaEffects.take(swEventChannel, (action: SDKActions) => {
        if (action.type === 'calling.call.state') {
          // To avoid mixing events on `connect` we check
          // for `instance.id` if there's already a callId
          // value.
          if (instance.id) {
            return instance.id === action.payload.call_id
          }
          return instance.tag === action.payload.tag
        }
        return false
      })

    /**
     * Override (or inject) "tag" with `instance.tag`
     * because we use it as namespace in the EE and:
     * - all the inbound legs have no "tag" in the
     *   `calling.call.state` events
     * - all the legs created by a "connect" RPC will share
     *   the same "tag" of the originator leg to allow the
     *   SDK to make a relation
     *
     * Since in the SDK each Call has its own "tag"
     * (__uuid), we need to target them through the EE with
     * the right "tag".
     */
    const newPayload = {
      ...action.payload,
      tag: instance.tag,
    }

    /**
     * Update the Call object payload with the new state
     */
    yield sagaEffects.put(pubSubChannel, {
      type: 'calling.call.state',
      payload: newPayload,
    })

    if (newPayload.call_state === 'ended') {
      done()
    }
  }

  getLogger().trace('voiceCallStateWorker ended', instance.id, instance.tag)
}
