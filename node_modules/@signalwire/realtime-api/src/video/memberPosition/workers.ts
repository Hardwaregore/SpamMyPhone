import {
  sagaEffects,
  SagaIterator,
  SDKWorker,
  MemberPosition,
  findNamespaceInPayload,
} from '@signalwire/core'

export const memberPositionWorker: SDKWorker<any> =
  function* memberPositionWorker(options): SagaIterator {
    const { instance, channels } = options
    const { swEventChannel } = channels
    const action = yield sagaEffects.take(swEventChannel, (action: any) => {
      const istargetEvent = action.type === 'video.room.subscribed'

      return (
        istargetEvent &&
        findNamespaceInPayload(action) === instance._eventsNamespace
      )
    })

    yield sagaEffects.fork(MemberPosition.memberPositionWorker, {
      ...options,
      initialState: action.payload,
    })
  }
