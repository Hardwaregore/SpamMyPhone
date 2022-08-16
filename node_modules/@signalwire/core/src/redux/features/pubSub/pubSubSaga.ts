import { SagaIterator } from '@redux-saga/core'
import { take } from '@redux-saga/core/effects'
import {
  isInternalGlobalEvent,
  toInternalEventName,
  getLogger,
} from '../../../utils'
import type { EventEmitter } from '../../../utils/EventEmitter'
import type { PubSubChannel, PubSubAction } from '../../interfaces'
import { findNamespaceInPayload } from '../shared/namespace'

type PubSubSagaParams = {
  pubSubChannel: PubSubChannel
  emitter: EventEmitter<string>
}

export function* pubSubSaga({
  pubSubChannel,
  emitter,
}: PubSubSagaParams): SagaIterator<any> {
  while (true) {
    const pubSubAction: PubSubAction = yield take(pubSubChannel, '*')
    const { type, payload } = pubSubAction
    try {
      const namespace = findNamespaceInPayload(pubSubAction)
      /**
       * There are events (like `video.room.started`/`video.room.ended`) that can
       * be consumed from different places, like from a `roomObj`
       * (namespaced Event Emitter) or from a `client`
       * (non-namespaced/global Event Emitter) so we must trigger the
       * event twice to reach everyone.
       */
      if (isInternalGlobalEvent(type)) {
        emitter.emit(type, payload)
      }

      getLogger().trace(
        'Emit:',
        toInternalEventName<string>({ namespace, event: type })
      )
      emitter.emit(
        toInternalEventName<string>({ namespace, event: type }),
        payload
      )
    } catch (error) {
      getLogger().error(error)
    }
  }
}
