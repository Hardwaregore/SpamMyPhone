import { configureStore, EventEmitter, actions } from '@signalwire/core'
import { Session } from './Session'

const PROJECT_ID = '8f0a119a-cda7-4497-a47d-c81493b824d4'
const TOKEN = '<VRT>'

/**
 * Helper method to configure a Store w/o Saga middleware.
 * Useful to test slices and reducers logic.
 *
 * @returns Redux Store
 */
export const configureJestStore = () => {
  return configureStore({
    userOptions: {
      project: PROJECT_ID,
      token: TOKEN,
      devTools: false,
      emitter: new EventEmitter(),
    },
    SessionConstructor: Session,
    runSagaMiddleware: false,
  })
}

/**
 * Helper method to configure a Store with a rootSaga
 * and a mocked Session object.
 * This allow to write integration tests.
 *
 * @returns { store, session, emitter, destroy }
 */
export const configureFullStack = () => {
  const session = {
    dispatch: console.log,
    connect: jest.fn(),
    disconnect: jest.fn(),
    execute: jest.fn(),
  }
  const emitter = new EventEmitter()
  const store = configureStore({
    userOptions: {
      project: PROJECT_ID,
      token: TOKEN,
      devTools: false,
      emitter,
    },
    SessionConstructor: jest.fn().mockImplementation(() => {
      return session
    }),
  })

  store.dispatch(actions.initAction())
  store.dispatch(actions.authSuccessAction())

  return {
    store,
    session,
    emitter,
    destroy: () => store.dispatch(actions.destroyAction()),
  }
}
