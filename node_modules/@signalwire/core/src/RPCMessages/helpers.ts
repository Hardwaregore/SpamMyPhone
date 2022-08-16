import { uuid } from '../utils'
import { JSONRPCMethod } from '../utils/interfaces'

interface MakeRPCRequestParams {
  id?: string
  method: JSONRPCMethod
  params: {
    // TODO: use list of types?
    [key: string]: any
  }
}
export const makeRPCRequest = (params: MakeRPCRequestParams) => {
  return {
    jsonrpc: '2.0' as const,
    id: params.id ?? uuid(),
    ...params,
  }
}

interface MakeRPCResponseParams {
  id: string
  result: {
    // TODO: use list of types?
    [key: string]: any
  }
}
export const makeRPCResponse = (params: MakeRPCResponseParams) => {
  return {
    jsonrpc: '2.0' as const,
    ...params,
  }
}
