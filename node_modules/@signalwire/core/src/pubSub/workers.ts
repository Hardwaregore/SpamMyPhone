import { BasePubSubConsumer } from './BasePubSub'
import {
  sagaEffects,
  SagaIterator,
  SDKWorker,
  getLogger,
  PubSubEventAction,
} from '..'
import { PRODUCT_PREFIX_PUBSUB } from '../utils/constants'

export const pubSubWorker: SDKWorker<BasePubSubConsumer> =
  function* pubSubWorker({ channels: { pubSubChannel } }): SagaIterator {
    while (true) {
      const action: PubSubEventAction = yield sagaEffects.take(
        (action: any) => {
          return action.type.startsWith(`${PRODUCT_PREFIX_PUBSUB}.`)
        }
      )
      getLogger().debug('pubSubWorker:', action)

      switch (action.type) {
        case `${PRODUCT_PREFIX_PUBSUB}.channel.message`: {
          yield sagaEffects.put(pubSubChannel, {
            /**
             * FIXME: This is a hack to get the message to the
             * correct channel. We'll fix this once we have a
             * proper way to setup the prefix `channel` at a
             * BaseConsumer level.
             */
            type: `${PRODUCT_PREFIX_PUBSUB}.message` as any,
            payload: action.payload,
          })
          break
        }

        default: {
          getLogger().warn('[pubSubWorker] Unrecognized Action', action)
          break
        }
      }
    }
  }
