import { makeRPCRequest } from './helpers'
import { JSONRPCMethod } from '../utils/interfaces'

type RPCExecuteParams = {
  id?: string
  method: JSONRPCMethod
  params: Record<string, unknown>
}

export const RPCExecute = ({ method, params }: RPCExecuteParams) => {
  return makeRPCRequest({
    method,
    params,
  })
}
