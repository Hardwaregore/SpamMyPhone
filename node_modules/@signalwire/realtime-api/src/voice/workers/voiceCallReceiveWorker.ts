import {
  getLogger,
  sagaEffects,
  SagaIterator,
  SDKWorker,
} from '@signalwire/core'
import type { Client } from '../../client/index'

export const voiceCallReceiveWorker: SDKWorker<Client> = function* (
  options
): SagaIterator {
  getLogger().trace('voiceCallReceiveWorker started')
  const { channels, instance } = options
  const { swEventChannel, pubSubChannel } = channels
  // contexts is required
  const { contexts = [] } = instance?.options ?? {}
  if (!contexts.length) {
    throw new Error('Invalid contexts to receive inbound calls')
  }

  while (true) {
    const action = yield sagaEffects.take(swEventChannel, (action: any) => {
      return (
        action.type === 'calling.call.receive' &&
        contexts.includes(action.payload.context)
      )
    })

    yield sagaEffects.put(pubSubChannel, {
      type: 'calling.call.received',
      payload: action.payload,
    })
  }

  getLogger().trace('voiceCallReceiveWorker ended')
}
