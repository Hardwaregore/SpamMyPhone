import { Store } from 'redux'
import { expectSaga } from 'redux-saga-test-plan'
import { configureJestStore } from '../../../testUtils'
import { componentCleanupSagaWorker } from './componentSaga'
import { rootReducer } from '../../rootReducer'

describe('componentCleanupSaga', () => {
  let store: Store

  beforeEach(() => {
    store = configureJestStore({
      preloadedState: {
        components: {
          byId: {
            '268b4cf8-a3c5-4003-8666-3b7a4f0a5af9': {
              id: '268b4cf8-a3c5-4003-8666-3b7a4f0a5af9',
            },
            'faa63915-3a64-4c39-acbb-06dac0758f8a': {
              id: 'faa63915-3a64-4c39-acbb-06dac0758f8a',
              responses: {},
            },
            'zfaa63915-3a64-4c39-acbb-06dac0758f8a': {
              id: 'zfaa63915-3a64-4c39-acbb-06dac0758f8a',
              errors: {},
            },
          },
        },
      },
    })
  })
  it('should cleanup unused components from the store', () => {
    return expectSaga(componentCleanupSagaWorker)
      .withReducer(rootReducer, store.getState())
      .hasFinalState({
        components: {
          byId: {
            '268b4cf8-a3c5-4003-8666-3b7a4f0a5af9': {
              id: '268b4cf8-a3c5-4003-8666-3b7a4f0a5af9',
            },
          },
        },
        session: {
          protocol: '',
          iceServers: [],
          authStatus: 'unknown',
          authState: undefined,
          authError: undefined,
          authCount: 0,
        },
        executeQueue: { queue: [] },
      })
      .run()
  })
})
