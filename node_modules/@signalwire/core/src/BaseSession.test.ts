import WS from 'jest-websocket-mock'

import { BaseSession } from './BaseSession'
import { socketMessageAction } from './redux/actions'
import {
  RPCConnect,
  RPCPing,
  RPCPingResponse,
  RPCDisconnectResponse,
} from './RPCMessages'
import { wait } from './testUtils'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid'),
  }
})

describe('BaseSession', () => {
  const host = 'ws://localhost:8080'
  const project = '2506edbc-35c4-4d9f-a5f0-45a03d82dab1'
  const token = 'PT1234abc'
  const rpcConnect = RPCConnect({
    authentication: {
      project,
      token,
    },
  })

  let ws: WS
  let session: BaseSession
  beforeEach(() => {
    ws = new WS(host)
    session = new BaseSession({
      host,
      project,
      token,
    })
    session.WebSocketConstructor = WebSocket
    session.dispatch = jest.fn()
  })
  afterEach(() => {
    WS.clean()
  })

  it('should connect and disconnect to/from the provided host', async () => {
    session.connect()
    await ws.connected

    expect(session.connected).toBe(true)

    session.disconnect()

    expect(session.connected).toBe(false)
    expect(session.closed).toBe(true)
  })

  it('should try to connect with normal token on socket open', async () => {
    session.connect()
    await ws.connected

    await expect(ws).toReceiveMessage(JSON.stringify(rpcConnect))
  })

  it('should set idle mode on signalwire.disconnect', async () => {
    session.connect()
    await ws.connected

    await expect(ws).toReceiveMessage(JSON.stringify(rpcConnect))
    const request = {
      jsonrpc: '2.0',
      id: 'uuid',
      method: 'signalwire.disconnect',
      params: {},
    }
    ws.send(JSON.stringify(request))

    expect(session.status).toEqual('unknown')
    const response = RPCDisconnectResponse(request.id)
    await expect(ws).toReceiveMessage(JSON.stringify(response))
    expect(session.status).toEqual('idle')
  })

  it('should invoke dispatch with socketMessage action for any other message', async () => {
    session.connect()
    await ws.connected

    await expect(ws).toReceiveMessage(JSON.stringify(rpcConnect))
    const request = {
      jsonrpc: '2.0' as const,
      id: 'uuid',
      method: 'signalwire.event' as const,
      params: {
        key: 'value',
      },
    }
    ws.send(JSON.stringify(request))

    expect(session.dispatch).toHaveBeenCalledTimes(1)
    expect(session.dispatch).toHaveBeenCalledWith(socketMessageAction(request))
  })

  describe('signalwire.ping messages', () => {
    it('should response to signalwire.ping', async () => {
      session.connect()
      await ws.connected

      await expect(ws).toReceiveMessage(JSON.stringify(rpcConnect))

      const ping = RPCPing()
      ping.id = 'ping-uuid'
      ws.send(JSON.stringify(ping))

      const response = RPCPingResponse(ping.id, ping.params.timestamp)
      await expect(ws).toReceiveMessage(JSON.stringify(response))
    })

    it('should close the connection if no signalwire.ping comes within _checkPingDelay', async () => {
      // Force _checkPingDelay to 5ms
      session['_checkPingDelay'] = 5

      session.connect()
      await ws.connected

      const ping = RPCPing()
      ping.id = 'ping-uuid'
      ws.send(JSON.stringify(ping))

      // Expect the session to be closed after 10ms
      await wait(10)
      expect(session.connected).toBe(false)
      expect(session.closed).toBe(true)
    })
  })
})
