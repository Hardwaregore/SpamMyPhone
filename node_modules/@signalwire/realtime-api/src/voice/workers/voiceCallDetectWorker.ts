import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKActions,
  CallingCallDetectEvent,
  MapToPubSubShape,
} from '@signalwire/core'
import { callingDetectTriggerEvent } from '../Call'
import type { Call } from '../Call'

export const voiceCallDetectWorker: SDKWorker<Call> = function* (
  options
): SagaIterator {
  getLogger().trace('voiceCallDetectWorker started')
  const { channels, instance, initialState } = options
  const { swEventChannel, pubSubChannel } = channels
  const { controlId, waitForBeep = false } = initialState
  if (!controlId) {
    throw new Error('Missing controlId for tapping')
  }

  let waitingForReady = false
  let run = true
  let lastAction!: MapToPubSubShape<CallingCallDetectEvent>
  const done = () => (run = false)

  while (run) {
    const action: MapToPubSubShape<CallingCallDetectEvent> =
      yield sagaEffects.take(swEventChannel, (action: SDKActions) => {
        return (
          action.type === 'calling.call.detect' &&
          action.payload.control_id === controlId
        )
      })

    const { detect } = action.payload
    if (!detect) {
      // Ignore events without detect and (also) make TS happy
      continue
    }
    lastAction = action

    /** Add `tag` to the payload to allow pubSubSaga to match it with the Call namespace */
    const payloadWithTag = {
      tag: instance.tag,
      ...action.payload,
    }

    /**
     * Update the original CallDetect object using the transform pipeline
     */
    yield sagaEffects.put(pubSubChannel, {
      // @ts-ignore
      type: callingDetectTriggerEvent,
      // @ts-ignore
      payload: payloadWithTag,
    })

    const {
      type,
      params: { event },
    } = detect

    if (event === 'error' || event === 'finished') {
      yield sagaEffects.put(pubSubChannel, {
        type: 'calling.detect.ended',
        payload: payloadWithTag,
      })

      done()
      continue
    }

    yield sagaEffects.put(pubSubChannel, {
      type: 'calling.detect.updated',
      payload: payloadWithTag,
    })

    switch (type) {
      // case 'digit':
      // case 'fax': {
      //   break
      // }
      case 'machine': {
        if (waitingForReady && event === 'READY') {
          yield sagaEffects.put(pubSubChannel, {
            type: 'calling.detect.ended',
            payload: payloadWithTag,
          })

          done()
        }
        if (waitForBeep) {
          waitingForReady = true
        }
        break
      }
    }
  }

  if (lastAction) {
    /**
     * On endef, dispatch an event to resolve `waitForResult` in CallDetect
     * overriding the `tag` to be the controlId
     */
    yield sagaEffects.put(pubSubChannel, {
      type: 'calling.detect.ended',
      payload: {
        ...lastAction.payload,
        tag: controlId,
      },
    })
  }

  getLogger().trace('voiceCallDetectWorker ended')
}
