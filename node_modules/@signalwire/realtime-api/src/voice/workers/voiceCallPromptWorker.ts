import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKActions,
  CallingCallCollectEvent,
  MapToPubSubShape,
} from '@signalwire/core'
import { callingPromptTriggerEvent } from '../Call'
import type { Call } from '../Call'

export const voiceCallPromptWorker: SDKWorker<Call> = function* (
  options
): SagaIterator {
  getLogger().trace('voiceCallPromptWorker started')
  const { channels, instance, initialState } = options
  const { swEventChannel, pubSubChannel } = channels
  const { controlId } = initialState
  if (!controlId) {
    throw new Error('Missing controlId for prompt')
  }

  let run = true
  const done = () => (run = false)

  while (run) {
    const action: MapToPubSubShape<CallingCallCollectEvent> =
      yield sagaEffects.take(swEventChannel, (action: SDKActions) => {
        return (
          action.type === 'calling.call.collect' &&
          action.payload.control_id === controlId
        )
      })

    /** Add `tag` to the payload to allow pubSubSaga to match it with the Call namespace */
    const payloadWithTag = {
      tag: instance.tag,
      ...action.payload,
    }

    /**
     * Update the original CallPrompt object using the transform pipeline
     */
    yield sagaEffects.put(pubSubChannel, {
      // @ts-expect-error
      type: callingPromptTriggerEvent,
      // @ts-ignore
      payload: payloadWithTag,
    })

    if (action.payload.result) {
      let typeToEmit: 'calling.prompt.failed' | 'calling.prompt.ended'
      switch (action.payload.result.type) {
        case 'no_match':
        case 'no_input':
        case 'error': {
          typeToEmit = 'calling.prompt.failed'
          break
        }
        case 'speech':
        case 'digit': {
          typeToEmit = 'calling.prompt.ended'
          break
        }
        // case 'start_of_speech': { TODO:
        //   break
        // }
      }

      yield sagaEffects.put(pubSubChannel, {
        type: typeToEmit,
        payload: payloadWithTag,
      })

      /**
       * Dispatch an event to resolve `waitForResult` in CallPrompt
       * when ended
       */
      yield sagaEffects.put(pubSubChannel, {
        type: typeToEmit,
        // @ts-ignore
        payload: {
          tag: controlId,
          ...action.payload,
        },
      })

      done()
    }

    /**
     * Only when partial_results: true
     */
    if (action.payload.final === false) {
      yield sagaEffects.put(pubSubChannel, {
        type: 'calling.prompt.updated',
        payload: payloadWithTag,
      })
    }
  }

  getLogger().trace('voiceCallPromptWorker ended')
}
