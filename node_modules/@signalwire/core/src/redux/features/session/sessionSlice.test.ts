import { Store } from 'redux'
import { configureJestStore, rpcConnectResultVRT } from '../../../testUtils'
import { sessionActions, initialSessionState } from './sessionSlice'
import { destroyAction } from '../../actions'

describe('SessionState Tests', () => {
  let store: Store

  beforeEach(() => {
    store = configureJestStore()
  })

  it('should seed SessionState on sessionActions.connected action', () => {
    store.dispatch(sessionActions.connected(rpcConnectResultVRT))

    expect(store.getState().session).toStrictEqual({
      protocol: rpcConnectResultVRT.protocol,
      iceServers: rpcConnectResultVRT.ice_servers,
      authStatus: 'authorized',
      authState: {
        media_allowed: 'all',
        audio_allowed: 'both',
        project: '8f0a119a-cda7-4497-a47d-c81493b824d4',
        resource: '9c80f1e8-9430-4070-a043-937eb3a96b38',
        room: {
          name: 'lobby',
          scopes: ['room.self.audio_mute', 'room.self.audio_unmute'],
        },
        scope_id: '26675883-8499-4ee9-85eb-691c4aa209f8',
        scopes: ['video'],
        signature:
          'SGZtkRD9fvuBAOUp1UF56zESxdEvGT6qSGZtkRD9fvuBAOUp1UF56zESxdEvGT6q',
        type: 'video',
        user_name: 'Joe',
        video_allowed: 'both',
      },
      authError: undefined,
      authCount: 1,
    })
  })

  it('should reset to initial on destroyAction', () => {
    store.dispatch(sessionActions.connected(rpcConnectResultVRT))

    store.dispatch(destroyAction())
    expect(store.getState().session).toStrictEqual(initialSessionState)
  })
})
