import { SDKState } from '../../interfaces'

export const getIceServers = ({ session }: SDKState) => {
  return session?.iceServers ?? []
}

export const getSession = (store: SDKState) => {
  return store.session
}

export const getAuthStatus = ({ session }: SDKState) => {
  return session.authStatus
}

export const getAuthError = ({ session }: SDKState) => {
  return session.authError
}

export const getAuthState = ({ session }: SDKState) => {
  return session.authState
}
