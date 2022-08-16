import {
  RPCConnect,
  RPCConnectParams,
  RPCReauthenticate,
  RPCReauthenticateParams,
} from './RPCMessages'
import { SessionOptions } from './utils/interfaces'
import { BaseSession } from './BaseSession'
import { authExpiringAction } from './redux/actions'

export class BaseJWTSession extends BaseSession {
  /**
   * Can be set a value different then zero
   * to force the JWT as expired within X seconds.
   * TODO: Remove this workaround.
   */
  private _expiredDiffSeconds = 0
  private _refreshTokenNotificationDiff = 120
  /**
   * Check the JWT expiration every 20seconds
   */
  private _checkTokenExpirationDelay = 20 * 1000
  private _checkTokenExpirationTimer: any = null

  constructor(public options: SessionOptions) {
    super(options)

    this._checkTokenExpiration = this._checkTokenExpiration.bind(this)
    this.reauthenticate = this.reauthenticate.bind(this)
  }

  get expiresAt() {
    const expiresAt = this?._rpcConnectResult?.authorization?.expires_at ?? 0
    if (typeof expiresAt === 'string') {
      const parsed = Date.parse(expiresAt)
      if (!isNaN(parsed)) {
        return Math.floor(parsed / 1000)
      }
    }
    return expiresAt
  }

  get expiresIn() {
    const now = Math.floor(Date.now() / 1000)
    return this.expiresAt - now
  }

  get expired() {
    return this.expiresIn <= this._expiredDiffSeconds
  }

  /**
   * Authenticate with the SignalWire Network
   * using JWT
   * @return Promise<void>
   */
  async authenticate() {
    const params: RPCConnectParams = {
      agent: this.agent,
      version: this.connectVersion,
      authentication: {
        jwt_token: this.options.token,
      },
    }

    if (this._relayProtocolIsValid()) {
      params.protocol = this.relayProtocol
    } else {
      /**
       * TODO: Find out a better way to get the prevProtocol
       */
      const prevProtocol = await this.retrieveRelayProtocol()
      if (prevProtocol) {
        params.protocol = prevProtocol
      }
    }

    this._rpcConnectResult = await this.execute(RPCConnect(params))
    await this.persistRelayProtocol()
    this._checkTokenExpiration()
  }

  async retrieveRelayProtocol() {
    // no-op
    return ''
  }

  async persistRelayProtocol() {
    // no-op
  }

  /**
   * Reauthenticate with the SignalWire Network
   * using a newer JWT. If the session has expired
   * will reconnect it.
   * @return Promise<void>
   */
  async reauthenticate() {
    if (this.expired) {
      return this.connect()
    }

    const params: RPCReauthenticateParams = {
      project: this._rpcConnectResult.authorization.project,
      jwt_token: this.options.token,
    }

    try {
      this._rpcConnectResult = await this.execute(RPCReauthenticate(params))
    } catch (error) {
      clearTimeout(this._checkTokenExpirationTimer)
      throw error
    }
  }

  protected override _onSocketClose(event: CloseEvent) {
    clearTimeout(this._checkTokenExpirationTimer)
    super._onSocketClose(event)
  }

  /**
   * Set a timer to dispatch a notification when the JWT is going to expire.
   * @return void
   */
  protected _checkTokenExpiration() {
    if (!this.expiresAt) {
      return
    }
    if (this.expiresIn <= this._refreshTokenNotificationDiff) {
      this.dispatch(authExpiringAction())

      if (this.options._onRefreshToken) {
        this.options._onRefreshToken()
      } else {
        this.logger.warn('The token is going to expire!')
      }
    }
    clearTimeout(this._checkTokenExpirationTimer)
    if (!this.expired) {
      this._checkTokenExpirationTimer = setTimeout(
        this._checkTokenExpiration,
        this._checkTokenExpirationDelay
      )
    }
  }
}
