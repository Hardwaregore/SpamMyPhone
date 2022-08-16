import { makeRPCRequest, makeRPCResponse } from './helpers'
import { VertoMethod } from '../utils/interfaces'

type VertoParams = { [key: string]: any }

const tmpMap: VertoParams = {
  id: 'callID',
  destinationNumber: 'destination_number',
  remoteCallerName: 'remote_caller_id_name',
  remoteCallerNumber: 'remote_caller_id_number',
  callerName: 'caller_id_name',
  callerNumber: 'caller_id_number',
}

/**
 * Translate SDK fields into verto variables
 */
const filterVertoParams = (params: VertoParams) => {
  if (params.hasOwnProperty('dialogParams')) {
    // prettier-ignore
    const {
      remoteSdp,
      localStream,
      remoteStream,
      ...dialogParams
    } = params.dialogParams
    for (const key in tmpMap) {
      if (key && dialogParams.hasOwnProperty(key)) {
        // @ts-ignore
        dialogParams[tmpMap[key]] = dialogParams[key]
        delete dialogParams[key]
      }
    }
    params.dialogParams = dialogParams
  }

  return params
}

const buildVertoRPCMessage = (method: VertoMethod) => {
  return (params: VertoParams = {}) => {
    return makeRPCRequest({
      method,
      params: filterVertoParams(params),
    })
  }
}

export const VertoInvite = buildVertoRPCMessage('verto.invite')
export const VertoBye = buildVertoRPCMessage('verto.bye')
export const VertoAttach = buildVertoRPCMessage('verto.attach')
export const VertoModify = buildVertoRPCMessage('verto.modify')
export const VertoInfo = buildVertoRPCMessage('verto.info')
export const VertoAnswer = buildVertoRPCMessage('verto.answer')
export const VertoPong = buildVertoRPCMessage('verto.pong')
export const VertoResult = (id: string, method: VertoMethod) => {
  return makeRPCResponse({
    id,
    result: {
      method,
    },
  })
}
