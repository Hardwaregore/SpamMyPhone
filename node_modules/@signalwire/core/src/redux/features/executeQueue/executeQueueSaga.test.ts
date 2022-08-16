import { Store } from 'redux'
import { expectSaga } from 'redux-saga-test-plan'
import { executeQueueWatcher } from './executeQueueSaga'
import { executeQueueActions } from './executeQueueSlice'
import { ExecuteActionParams } from '../../interfaces'
import { executeAction } from '../../actions'
import { rootReducer } from '../../rootReducer'
import { configureJestStore } from '../../../testUtils'
import { sessionActions } from '../session/sessionSlice'

describe('executeQueueWatcher', () => {
  let store: Store

  beforeEach(() => {
    store = configureJestStore()
  })

  it('should listen for executeAction.type and add them to the queue if the user is not authenticated', () => {
    const payload: ExecuteActionParams = {
      method: 'signalwire.subscribe',
      params: {
        event_channel: 'rooms',
        get_initial_state: true,
        events: ['video.room.started', 'video.room.ended'],
      },
    }

    return expectSaga(executeQueueWatcher)
      .withReducer(rootReducer)
      .put(executeQueueActions.add(payload))
      .dispatch(executeAction(payload))
      .hasFinalState({
        ...store.getState(),
        executeQueue: { queue: [payload] },
      })
      .silentRun()
  })

  it('should not add executeAction.type to the queue when the user is authenticated', () => {
    const payload: ExecuteActionParams = {
      method: 'signalwire.subscribe',
      params: {
        event_channel: 'rooms',
        get_initial_state: true,
        events: ['video.room.started', 'video.room.ended'],
      },
    }
    const state = store.getState()

    return expectSaga(executeQueueWatcher)
      .withReducer(rootReducer)
      .dispatch(sessionActions.connected({} as any))
      .dispatch(executeAction(payload))
      .hasFinalState({
        ...state,
        session: {
          ...state.session,
          authStatus: 'authorized',
          authCount: 1,
        },
      })
      .silentRun()
  })
})
