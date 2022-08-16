import { Store } from 'redux'
import { configureJestStore } from '../../../testUtils'
import {
  executeQueueActions,
  initialExecuteQueueState,
} from './executeQueueSlice'
import { ExecuteActionParams } from '../../interfaces'
import { destroyAction } from '../../actions'

describe('ExecuteQueueState Tests', () => {
  let store: Store

  beforeEach(() => {
    store = configureJestStore()
  })

  it('should add ExecuteParams to the queue on executeQueueActions.add action and reset it on executeQueueActions.add action', () => {
    const payload: ExecuteActionParams = {
      method: 'signalwire.subscribe',
      params: {
        event_channel: 'rooms',
        get_initial_state: true,
        events: ['video.room.started', 'video.room.ended'],
      },
    }

    store.dispatch(executeQueueActions.add(payload))
    expect(store.getState().executeQueue.queue).toStrictEqual([payload])

    store.dispatch(executeQueueActions.clean())
    expect(store.getState().executeQueue.queue).toStrictEqual([])
  })

  it('should reset to initial on destroyAction', () => {
    const payload: ExecuteActionParams = {
      method: 'signalwire.subscribe',
      params: {
        event_channel: 'rooms',
        get_initial_state: true,
        events: ['video.room.started', 'video.room.ended'],
      },
    }
    store.dispatch(executeQueueActions.add(payload))

    store.dispatch(destroyAction())
    expect(store.getState().executeQueue).toStrictEqual(
      initialExecuteQueueState
    )
  })
})
