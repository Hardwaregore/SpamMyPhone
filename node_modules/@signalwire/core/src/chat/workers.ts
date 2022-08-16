import { BaseChatConsumer } from './BaseChat'
import { sagaEffects, SagaIterator, SDKWorker, getLogger, ChatAction } from '..'
import { PRODUCT_PREFIX_PUBSUB, PRODUCT_PREFIX_CHAT } from '../utils/constants'

export const chatWorker: SDKWorker<BaseChatConsumer> = function* chatWorker({
  channels: { pubSubChannel },
}): SagaIterator {
  while (true) {
    const action: ChatAction = yield sagaEffects.take((action: any) => {
      return action.type.startsWith('chat.')
    })
    getLogger().debug('chatWorker:', action)

    switch (action.type) {
      case 'chat.channel.message': {
        /**
         * Since `Chat` is built on top of `PubSub` (which
         * also has a worker) and for the time being both
         * namespaces are using the same PRODUCT_PREFIX
         * there is an overlap on the `chat.channel.message`
         * event which is automatically handled by
         * `pubSubWorker`. This means that as long as both
         * namespace share the same PRODUCT_PREFIX the
         * `chat.channel.message` event will be a no-op for
         * `Chat`.
         */
        if (PRODUCT_PREFIX_CHAT === PRODUCT_PREFIX_PUBSUB) {
          break
        }

        yield sagaEffects.put(pubSubChannel, {
          /**
           * FIXME: This is a hack to get the message to the
           * correct channel. We'll fix this once we have a
           * proper way to setup the prefix `channel` at a
           * BaseConsumer level.
           */
          type: 'chat.message' as any,
          payload: action.payload,
        })
        break
      }
      case 'chat.member.joined':
      case 'chat.member.updated':
      case 'chat.member.left':
        yield sagaEffects.put(pubSubChannel, action)
        break

      default: {
        getLogger().warn('[chatWorker] Unrecognized Action', action)
        break
      }
    }
  }
}
