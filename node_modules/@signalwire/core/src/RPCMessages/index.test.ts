import {
  RPCConnect,
  RPCReauthenticate,
  RPCPing,
  RPCPingResponse,
  RPCExecute,
  RPCDisconnectResponse,
  VertoBye,
  VertoAttach,
  VertoInfo,
  VertoInvite,
  VertoModify,
  DEFAULT_CONNECT_VERSION,
} from './index'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid'),
  }
})

describe('RPC Messages', () => {
  describe('RPCConnect', () => {
    it('should generate the message with token', function () {
      const authentication = { project: 'project', token: 'token' }
      const message = RPCConnect({ authentication })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.connect',
        params: {
          authentication: { project: 'project', token: 'token' },
          version: DEFAULT_CONNECT_VERSION,
        },
      })
    })

    it('should generate the message using sub-params', function () {
      const authentication = { project: 'project', token: 'token' }
      const message = RPCConnect({
        authentication,
        protocol: 'old-proto',
        contexts: ['test'],
      })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.connect',
        params: {
          authentication: { project: 'project', token: 'token' },
          version: DEFAULT_CONNECT_VERSION,
          protocol: 'old-proto',
          contexts: ['test'],
        },
      })
    })

    it('should generate the message with jwt_token', function () {
      const authentication = { project: 'project', jwt_token: 'jwt' }
      const message = RPCConnect({ authentication })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.connect',
        params: {
          authentication: { project: 'project', jwt_token: 'jwt' },
          version: DEFAULT_CONNECT_VERSION,
        },
      })
    })

    it('should generate the message using agent', function () {
      const authentication = {
        project: 'project',
        jwt_token: 'jwt',
      }
      const message = RPCConnect({
        authentication,
        agent: 'Jest Random Test',
      })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.connect',
        params: {
          authentication: { project: 'project', jwt_token: 'jwt' },
          version: DEFAULT_CONNECT_VERSION,
          agent: 'Jest Random Test',
        },
      })
    })

    it('should generate the message without project', function () {
      const authentication = { jwt_token: 'jwt' }
      const message = RPCConnect({
        authentication,
        agent: 'Jest Random Test',
      })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.connect',
        params: {
          authentication: { jwt_token: 'jwt' },
          version: DEFAULT_CONNECT_VERSION,
          agent: 'Jest Random Test',
        },
      })
    })
  })

  describe('RPCReauthenticate', () => {
    it('should generate the message', function () {
      const message = RPCReauthenticate({
        project: 'project',
        jwt_token: 'jwt',
      })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.reauthenticate',
        params: {
          authentication: { project: 'project', jwt_token: 'jwt' },
        },
      })
    })
  })

  describe('RPCPing', () => {
    it('should generate the message', function () {
      global.Date.now = jest.fn(() => 1581442824134)

      const message = RPCPing()
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'signalwire.ping',
        params: {
          timestamp: 1581442824134 / 1000,
        },
      })
    })

    it('should generate the response', function () {
      const message = RPCPingResponse('uuid', 1234)
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'uuid',
        result: {
          timestamp: 1234,
        },
      })
    })
  })

  describe('RPCExecute', () => {
    const method = 'signalwire.subscribe'
    const params = { key: 'value' }
    it('should generate the message based on protocol and method', function () {
      const message = RPCExecute({ method, params })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method,
        params,
      })
    })

    it('should generate the message based on protocol, method and specific params', function () {
      const message = RPCExecute({
        method,
        params: { x: 3, y: 6 },
      })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method,
        params: { x: 3, y: 6 },
      })
    })
  })

  describe('RPCDisconnect', () => {
    it('should generate the response', function () {
      const message = RPCDisconnectResponse('uuid')
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'uuid',
        result: {},
      })
    })
  })

  describe('Verto RPC Messages', () => {
    const dialogParams = {
      id: 'uuid',
      destinationNumber: 'roomName',
      remoteCallerName: 'Caller Name',
      remoteCallerNumber: 'Caller Number',
      callerName: 'Callee Name',
      callerNumber: 'Callee Number',
    }
    const vertoDialogParams = {
      callID: 'uuid',
      destination_number: 'roomName',
      remote_caller_id_name: 'Caller Name',
      remote_caller_id_number: 'Caller Number',
      caller_id_name: 'Callee Name',
      caller_id_number: 'Callee Number',
    }

    const allVertoMethods = [
      VertoBye,
      VertoAttach,
      VertoInfo,
      VertoInvite,
      VertoModify,
    ]

    it('should generate the message', function () {
      allVertoMethods.forEach((vertoFn) => {
        const message = vertoFn({
          dialogParams,
        })
        expect(message).toStrictEqual({
          jsonrpc: '2.0',
          id: 'mocked-uuid',
          method: message.method,
          params: {
            dialogParams: vertoDialogParams,
          },
        })
      })
    })
  })
})
