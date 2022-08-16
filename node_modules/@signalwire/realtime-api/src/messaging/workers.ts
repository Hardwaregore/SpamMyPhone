import {
  sagaEffects,
  SagaIterator,
  SDKWorker,
  getLogger,
  SDKActions,
} from '@signalwire/core'
import type { Messaging } from './Messaging'

export const messagingWorker: SDKWorker<Messaging> = function* (
  options
): SagaIterator {
  const { channels } = options
  const { swEventChannel, pubSubChannel } = channels
  while (true) {
    const action: SDKActions = yield sagaEffects.take(
      swEventChannel,
      (action: any) => {
        return action.type.startsWith('messaging.')
      }
    )
    getLogger().debug('messagingWorker:', action)

    /**
     * Rename the wire events to be consistent with other SDK events.
     * messaging.receive => message.received
     * messaging.state => message.updated
     */

    switch (action.type) {
      case 'messaging.receive': {
        // yield sagaEffects.put(pubSubChannel, action)

        yield sagaEffects.put(pubSubChannel, {
          type: 'message.received',
          payload: action.payload,
        })
        break
      }
      case 'messaging.state': {
        // yield sagaEffects.put(pubSubChannel, action)

        yield sagaEffects.put(pubSubChannel, {
          type: 'message.updated',
          payload: action.payload,
        })
        break
      }

      default: {
        getLogger().warn('[messagingWorker] Unrecognized Action', action)
        break
      }
    }
  }
}
