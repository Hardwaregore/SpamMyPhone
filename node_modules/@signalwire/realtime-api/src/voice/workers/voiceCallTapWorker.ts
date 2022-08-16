import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKActions,
  CallingCallTapEvent,
  MapToPubSubShape,
} from '@signalwire/core'
import { callingTapTriggerEvent } from '../Call'
import type { Call } from '../Call'

export const voiceCallTapWorker: SDKWorker<Call> = function* (
  options
): SagaIterator {
  getLogger().trace('voiceCallTapWorker started')
  const { channels, instance, initialState } = options
  const { swEventChannel, pubSubChannel } = channels
  const { controlId } = initialState
  if (!controlId) {
    throw new Error('Missing controlId for tapping')
  }

  let run = true
  const done = () => (run = false)

  while (run) {
    const action: MapToPubSubShape<CallingCallTapEvent> =
      yield sagaEffects.take(swEventChannel, (action: SDKActions) => {
        return (
          action.type === 'calling.call.tap' &&
          action.payload.control_id === controlId
        )
      })

    /** Add `tag` to the payload to allow pubSubSaga to match it with the Call namespace */
    const payloadWithTag = {
      tag: instance.tag,
      ...action.payload,
    }

    /**
     * Update the original CallTap object using the transform pipeline
     */
    yield sagaEffects.put(pubSubChannel, {
      // @ts-ignore
      type: callingTapTriggerEvent,
      // @ts-ignore
      payload: payloadWithTag,
    })

    switch (action.payload.state) {
      case 'tapping': {
        yield sagaEffects.put(pubSubChannel, {
          type: 'calling.tap.started',
          payload: payloadWithTag,
        })
        break
      }
      case 'finished': {
        yield sagaEffects.put(pubSubChannel, {
          type: 'calling.tap.ended',
          payload: payloadWithTag,
        })

        done()
        break
      }
    }
  }

  getLogger().trace('voiceCallTapWorker ended')
}
