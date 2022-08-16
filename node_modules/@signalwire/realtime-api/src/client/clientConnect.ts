import { RealtimeClient } from './Client'

export const clientConnect = (client: RealtimeClient) => {
  /**
   * We swallow the (possible) error here to avoid polluting
   * the stdout. The error itself won't be swallowed from
   * the user (it will be handled by our `rootSaga`) and we
   * can extend that behavior by adding the following
   * listener:
   * client.on('session.auth_error', () => { ... })
   */
  return client.connect().catch(() => {})
}
