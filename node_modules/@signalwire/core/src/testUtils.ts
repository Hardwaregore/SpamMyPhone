import { multicastChannel } from '@redux-saga/core'
import { configureStore, ConfigureStoreOptions, SDKStore } from './redux'
import { PubSubChannel, SwEventChannel } from './redux/interfaces'
import { BaseSession } from './BaseSession'
import { RPCConnectResult, InternalSDKLogger } from './utils/interfaces'
import { EventEmitter } from './utils/EventEmitter'
import { actions } from '.'

const PROJECT_ID = '8f0a119a-cda7-4497-a47d-c81493b824d4'
const TOKEN = '<VRT>'

export const createMockedLogger = (): InternalSDKLogger => ({
  fatal: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  wsTraffic: jest.fn(),
})

/**
 * Helper method to configure a Store w/o Saga middleware.
 * Useful to test slices and reducers logic.
 *
 * @returns Redux Store
 */
export const configureJestStore = (
  options?: Partial<ConfigureStoreOptions>
) => {
  return configureStore({
    userOptions: {
      project: PROJECT_ID,
      token: TOKEN,
      devTools: false,
      emitter: new EventEmitter(),
    },
    SessionConstructor: BaseSession,
    runSagaMiddleware: false,
    ...options,
  }) as SDKStore
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

export const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const rpcConnectResultVRT: RPCConnectResult = {
  identity:
    'f3bc99df-2c3d-4fa4-b1dc-e8a8ffc579e6@e3fefa44-1bad-4be9-ad9b-1cbb9abd60c7.west-us',
  authorization: {
    type: 'video',
    project: '8f0a119a-cda7-4497-a47d-c81493b824d4',
    scopes: ['video'],
    scope_id: '26675883-8499-4ee9-85eb-691c4aa209f8',
    resource: '9c80f1e8-9430-4070-a043-937eb3a96b38',
    user_name: 'Joe',
    room: {
      name: 'lobby',
      scopes: ['room.self.audio_mute', 'room.self.audio_unmute'],
    },
    signature:
      'SGZtkRD9fvuBAOUp1UF56zESxdEvGT6qSGZtkRD9fvuBAOUp1UF56zESxdEvGT6q',
    media_allowed: 'all',
    audio_allowed: 'both',
    video_allowed: 'both',
  },
  protocol:
    'signalwire_SGZtkRD9fvuBAOUp1UF56zESxdEvGT6qSGZtkRD9fvuBAOUp1UF56zESxdEvGT6q_03e8c927-8ea3-4661-86d5-778c3e03296a_8f0a119a-cda7-4497-a47d-c81493b824d4',
  ice_servers: [
    {
      urls: 'turn.swire.io:443',
      credential: 'sFTwvi8ShXcYNOcyYjFy3ATIUpQ=',
      credentialType: 'password',
      username: '1619521908:8f0a119a-cda7-4497-a47d-c81493b824d4',
    },
  ],
}

export const createPubSubChannel = (): PubSubChannel => multicastChannel()
export const createSwEventChannel = (): SwEventChannel => multicastChannel()
