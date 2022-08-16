import { makeRPCRequest } from './helpers'

type WithToken = { token: string; jwt_token?: never }
type WithJWT = { token?: never; jwt_token: string }
type RPCConnectAuthentication = { project?: string } & (WithToken | WithJWT)
export type RPCConnectParams = {
  authentication: RPCConnectAuthentication
  version?: typeof DEFAULT_CONNECT_VERSION
  agent?: string
  protocol?: string
  contexts?: string[]
}

export const DEFAULT_CONNECT_VERSION = {
  major: 3,
  minor: 0,
  revision: 0,
}

export const RPCConnect = (params: RPCConnectParams) => {
  return makeRPCRequest({
    method: 'signalwire.connect',
    params: {
      version: DEFAULT_CONNECT_VERSION,
      ...params,
    },
  })
}
