import { Store } from 'redux'
import createSagaMiddleware, {
  multicastChannel,
  Saga,
  Task,
} from '@redux-saga/core'
import { configureStore as rtConfigureStore } from './toolkit'
import { rootReducer } from './rootReducer'
import rootSaga from './rootSaga'
import { PubSubChannel, SDKState, SwEventChannel } from './interfaces'
import { connect } from './connect'
import {
  InternalUserOptions,
  SessionConstructor,
  InternalChannels,
} from '../utils/interfaces'

export interface ConfigureStoreOptions {
  userOptions: InternalUserOptions
  SessionConstructor: SessionConstructor
  runSagaMiddleware?: boolean
  preloadedState?: Partial<SDKState>
}

export type SDKStore = ReturnType<typeof configureStore>
export type SDKRunSaga = <S extends Saga>(
  saga: S,
  params?: Parameters<S>[0]
) => Task

const configureStore = (options: ConfigureStoreOptions) => {
  const {
    userOptions,
    SessionConstructor,
    preloadedState = {},
    runSagaMiddleware = true,
  } = options
  const sagaMiddleware = createSagaMiddleware()
  const pubSubChannel: PubSubChannel = multicastChannel()
  const swEventChannel: SwEventChannel = multicastChannel()
  /**
   * List of channels that are gonna be shared across all
   * sagas.
   */
  const channels: InternalChannels = {
    pubSubChannel,
    swEventChannel,
  }
  const store = rtConfigureStore({
    devTools: userOptions?.devTools ?? true,
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      // It is preferrable to use the chainable .concat(...) and
      // .prepend(...) methods of the returned MiddlewareArray instead
      // of the array spread operator, as the latter can lose valuable
      // type information under some circumstances.
      // @see https://redux-toolkit.js.org/api/getDefaultMiddleware#intended-usage
      getDefaultMiddleware().concat(sagaMiddleware),
  }) as Store
  const runSaga = <T>(
    saga: Saga,
    args: {
      instance: T
      runSaga: any
    }
  ) => {
    return sagaMiddleware.run(saga, {
      ...args,
      channels,
    })
  }

  if (runSagaMiddleware) {
    const saga = rootSaga({
      SessionConstructor,
    })
    sagaMiddleware.run(saga, { userOptions, channels })
  }

  return {
    ...store,
    runSaga,
  }
}

export { connect, configureStore }
export * from './actions'
export * from './utils/sagaHelpers'
export * from './toolkit'
