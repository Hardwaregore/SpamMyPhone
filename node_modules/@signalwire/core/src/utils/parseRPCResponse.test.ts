import { RPCConnect, RPCExecute } from '../RPCMessages'
import { parseRPCResponse } from './parseRPCResponse'

describe('parseRPCResponse', () => {
  const project = 'project'
  const token = 'token'

  describe('signalwire.connect', () => {
    const request = RPCConnect({
      authentication: { project, token },
    })

    it('should handle signalwire.connect success', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"9e72bf85-6404-4c00-a04b-1d35b678fcd2","result":{"identity":"8d8bb680-a6d2-4b84-ad5f-afb43759b0dd@3af07c8b-6a2b-48b7-81b5-2cd1fd0c9254.west-us","authorization":{"type":"video","project":"34429ef1-283b-4fa9-8ebc-43b59f97bb1f","scopes":["video"],"scope_id":"e85c456f-1bf6-4e4c-8e8b-ee1f004226e5","resource":"60c4333e-d892-4542-af34-d36531299934","user_name":"Edo","join_until":null,"join_from":null,"remove_at":null,"remove_after_seconds_elapsed":null,"auto_create_room":true,"room":{"name":"edoRoom2","scopes":[]},"signature":"q71f0159c3734a51cd53e2c5e56e65a0b808e3e9865e561379c3af173aad98642"},"protocol":"signalwire_random_string","ice_servers":[{"urls":["turn:turn.example.io:443"],"credential":"secret","credentialType":"password","username":"supersecret"}]}}'
      )
      expect(parseRPCResponse({ request, response })).toStrictEqual({
        result: response.result,
      })
    })

    it('should handle signalwire.connect failure', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"7b3a8c6d-49f1-4c10-81be-75f9b2295142","error":{"code":-32002,"message":"Authentication service failed with status ProtocolError, 401 Unauthorized: {}"}}'
      )
      expect(parseRPCResponse({ request, response })).toStrictEqual({
        error: response.error,
      })
    })
  })

  describe('execute methods', () => {
    const request = RPCExecute({
      method: 'signalwire.subscribe',
      params: { x: 1, y: 2 },
    })

    it('should handle the result', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"code":"200","message":"Playing","call_id":"call-id"}}'
      )
      expect(parseRPCResponse({ request, response })).toEqual({
        result: { code: '200', message: 'Playing', call_id: 'call-id' },
      })
    })

    it('should handle the error code within result', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"code":"-32001","message":"Permission Denied."}}'
      )
      expect(parseRPCResponse({ request, response })).toEqual({
        error: { code: '-32001', message: 'Permission Denied.' },
      })
    })

    it('should handle the error', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","error":{"code":-32601,"message":"Error Message"}}'
      )
      expect(parseRPCResponse({ request, response })).toEqual({
        error: response.error,
      })
    })

    it('should handle Verto result wrapped in JSONRPC', () => {
      const vertoResponse = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"code":"200","node_id":"node-id","result":{"jsonrpc":"2.0","id":"verto-uuid","result":{"message":"CALL CREATED","callID":"call-id"}}}}'
      )
      expect(parseRPCResponse({ request, response: vertoResponse })).toEqual({
        result: {
          message: 'CALL CREATED',
          callID: 'call-id',
          node_id: 'node-id',
        },
      })
    })

    it('should handle Verto error wrapped in JSONRPC', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"code":"200","node_id":"node-id","result":{"jsonrpc":"2.0","id":"123","error":{"message":"Random Error","callID":"call-id","code":"123"}}}}'
      )
      expect(parseRPCResponse({ request, response })).toEqual({
        error: { code: '123', message: 'Random Error', callID: 'call-id' },
      })
    })

    it('should handle nested "result" fields', () => {
      const response = JSON.parse(
        '{"jsonrpc":"2.0","id":"486cea22-ff10-48c3-bae6-8498fb25aef4","result":{"requester_identity":"9afe633f-e810-4ef2-bf54-efb5a6ce37d0@us","responder_identity":"a5686e42-9814-42f1-9060-1228c2b5cc67@us","result":{"data":"test"}},"hops":["31c1cb04-a2fe-4266-80ee-8da1c70c46f8@"]}'
      )
      expect(parseRPCResponse({ request, response })).toEqual({
        result: { data: 'test' },
      })
    })
  })
})
