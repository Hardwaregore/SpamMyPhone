import { makeRPCRequest, makeRPCResponse } from './helpers'

export const RPCPing = () => {
  return makeRPCRequest({
    method: 'signalwire.ping',
    params: {
      timestamp: Date.now() / 1000,
    },
  })
}

export const RPCPingResponse = (id: string, timestamp?: number) => {
  return makeRPCResponse({
    id,
    result: {
      timestamp: timestamp || Date.now() / 1000,
    },
  })
}
