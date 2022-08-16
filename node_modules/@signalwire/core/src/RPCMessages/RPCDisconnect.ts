import { makeRPCResponse } from './helpers'

export const RPCDisconnectResponse = (id: string) => {
  return makeRPCResponse({
    id,
    result: {},
  })
}
