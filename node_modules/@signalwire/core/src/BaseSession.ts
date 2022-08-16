import {
  uuid,
  getLogger,
  checkWebSocketHost,
  timeoutPromise,
  parseRPCResponse,
  safeParseJson,
  isJSONRPCResponse,
} from './utils'
import { PayloadAction } from './redux'
import { DEFAULT_HOST, WebSocketState } from './utils/constants'
import {
  RPCConnect,
  RPCConnectParams,
  DEFAULT_CONNECT_VERSION,
  RPCDisconnectResponse,
  RPCPingResponse,
} from './RPCMessages'
import {
  SessionOptions,
  SessionRequestObject,
  RPCConnectResult,
  JSONRPCRequest,
  JSONRPCResponse,
  WebSocketAdapter,
  NodeSocketAdapter,
  WebSocketClient,
  SessionStatus,
} from './utils/interfaces'
import {
  closeConnectionAction,
  authErrorAction,
  authSuccessAction,
  socketClosedAction,
  socketErrorAction,
  socketMessageAction,
} from './redux/actions'
import { sessionActions } from './redux/features/session/sessionSlice'

export const SW_SYMBOL = Symbol('BaseSession')

export class BaseSession {
  /** @internal */
  public __sw_symbol = SW_SYMBOL

  public uuid = uuid()
  public WebSocketConstructor: NodeSocketAdapter | WebSocketAdapter
  public agent: string
  public connectVersion = DEFAULT_CONNECT_VERSION
  public reauthenticate?(): Promise<void>

  protected _rpcConnectResult: RPCConnectResult

  private _requests = new Map<string, SessionRequestObject>()
  private _socket: WebSocketClient | null = null
  private _host: string = DEFAULT_HOST

  private _executeTimeoutMs = 10 * 1000
  private _executeTimeoutError = Symbol.for('sw-execute-timeout')

  private _checkPingDelay = 15 * 1000
  private _checkPingTimer: any = null
  private _status: SessionStatus = 'unknown'

  constructor(public options: SessionOptions) {
    const { host, logLevel = 'info' } = options
    if (host) {
      this._host = checkWebSocketHost(host)
    }

    if (logLevel) {
      /**
       * `setLevel` only makes sense when dealing with our
       * default logger. The error is expected because we
       * don't expose `setLevel` as part of our public
       * SDKLogger since there's no standard API across
       * loggers to do this.
       */
      // @ts-expect-error
      this.logger.setLevel?.(logLevel)
    }
    this._onSocketOpen = this._onSocketOpen.bind(this)
    this._onSocketError = this._onSocketError.bind(this)
    this._onSocketClose = this._onSocketClose.bind(this)
    this._onSocketMessage = this._onSocketMessage.bind(this)
    this.execute = this.execute.bind(this)
    this.connect = this.connect.bind(this)
  }

  get host() {
    return this._host
  }

  get rpcConnectResult() {
    return this._rpcConnectResult
  }

  get relayProtocol() {
    return this._rpcConnectResult?.protocol ?? ''
  }

  get signature() {
    return this._rpcConnectResult?.authorization?.signature
  }

  protected get logger() {
    return getLogger()
  }

  get connecting() {
    return this._socket?.readyState === WebSocketState.CONNECTING
  }

  get connected() {
    return this._socket?.readyState === WebSocketState.OPEN
  }

  get closing() {
    return this._socket?.readyState === WebSocketState.CLOSING
  }

  get closed() {
    return this._socket
      ? this._socket.readyState === WebSocketState.CLOSED
      : true
  }

  get status() {
    return this._status
  }

  set token(token: string) {
    this.options.token = token
  }

  /**
   * Connect the websocket
   *
   * @return void
   */
  connect(): void {
    if (!this?.WebSocketConstructor) {
      this.logger.error('Missing WebSocketConstructor')
      return
    }
    /**
     * Return if there is already a _socket instance.
     * This prevents issues if "connect()" is called multiple times.
     */
    if (this._socket) {
      this.logger.warn('Session already connected.')
      return
    }
    this._socket = this._createSocket()

    /** Handle 'open' once */
    const openHandler = (event: Event) => {
      this._socket?.removeEventListener('open', openHandler)
      this._onSocketOpen(event)
    }
    this._socket.addEventListener('open', openHandler)

    /** Handle 'close' once */
    const closeHandler = (event: CloseEvent) => {
      this._socket?.removeEventListener('close', closeHandler)
      this._onSocketClose(event)
    }
    this._socket.addEventListener('close', closeHandler)

    /** Handle 'error' once */
    const errorHandler = (event: Event) => {
      this._socket?.removeEventListener('error', errorHandler)
      this._onSocketError(event)
    }
    this._socket.addEventListener('error', errorHandler)

    /** Remove previous 'message' listener in case of reconnect */
    this._socket.removeEventListener('message', this._onSocketMessage)
    this._socket.addEventListener('message', this._onSocketMessage)
  }

  /**
   * Allow children classes to override it.
   * @return WebSocket instance
   */
  protected _createSocket() {
    return new this.WebSocketConstructor(this._host)
  }

  /**
   * Clear the Session and close the WS connection.
   * @return void
   */
  async disconnect() {
    /**
     * Return if there is not a _socket instance or
     * if it's already in closing state.
     */
    if (!this._socket || this.closing) {
      this.logger.warn('Session not connected or already in closing state.')
      return
    }

    clearTimeout(this._checkPingTimer)
    this._requests.clear()
    this._closeConnection('disconnected')
  }

  /**
   * Send a JSON object to the server.
   * @return Promise that will resolve/reject depending on the server response
   */
  execute(msg: JSONRPCRequest | JSONRPCResponse): Promise<any> {
    if (this._status === 'idle' || !this.connected) {
      return Promise.reject(
        "Can't call `execute` when Session is not authorized."
      )
    }
    let promise: Promise<unknown>
    if ('params' in msg) {
      // This is a request so save the "id" to resolve the Promise later
      promise = new Promise((resolve, reject) => {
        this._requests.set(msg.id, { rpcRequest: msg, resolve, reject })
      })
    } else {
      // This is a response so don't wait for a result
      promise = Promise.resolve()
    }

    this.logger.wsTraffic({ type: 'send', payload: msg })
    this._socket!.send(this.encode(msg))

    return timeoutPromise(
      promise,
      this._executeTimeoutMs,
      this._executeTimeoutError
    ).catch((error) => {
      if (error === this._executeTimeoutError) {
        this.logger.error('Request Timeout', msg)
        if (this.status === 'disconnected') {
          return this.logger.debug(
            'Request failed because the session is disconnected',
            this.status,
            this._socket
          )
        }

        // Possibly half-open connection so force close our side
        this._closeConnection('reconnecting')
      } else {
        throw error
      }
    })
  }

  /**
   * Authenticate with the SignalWire Network
   * @return Promise<void>
   */
  async authenticate() {
    const params: RPCConnectParams = {
      agent: this.agent,
      version: this.connectVersion,
      authentication: {
        project: this.options.project,
        token: this.options.token,
      },
    }
    if (this._relayProtocolIsValid()) {
      params.protocol = this.relayProtocol
    }
    if (this.options.contexts?.length) {
      params.contexts = this.options.contexts
    }
    this._rpcConnectResult = await this.execute(RPCConnect(params))
  }

  protected async _onSocketOpen(event: Event) {
    this.logger.debug('_onSocketOpen', event.type)
    try {
      await this.authenticate()
      this._status = 'connected'
      this.dispatch(authSuccessAction())
    } catch (error) {
      this.logger.error('Auth Error', error)
      this.dispatch(authErrorAction({ error }))
    }
  }

  protected _onSocketError(event: Event) {
    this.logger.debug('_onSocketError', event)
    this.dispatch(socketErrorAction())
  }

  protected _onSocketClose(event: CloseEvent) {
    this.logger.debug('_onSocketClose', event.type, event.code, event.reason)
    this._status =
      event.code >= 1006 && event.code <= 1014 ? 'reconnecting' : 'disconnected'
    this.dispatch(socketClosedAction())
    this._socket = null
  }

  protected _onSocketMessage(event: MessageEvent) {
    const payload = this.decode<JSONRPCRequest | JSONRPCResponse>(event.data)
    this.logger.wsTraffic({ type: 'recv', payload })

    if (isJSONRPCResponse(payload)) {
      const request = this._requests.get(payload.id)
      if (request) {
        const { rpcRequest, resolve, reject } = request
        this._requests.delete(payload.id)
        const { result, error } = parseRPCResponse({
          response: payload,
          request: rpcRequest,
        })
        return error ? reject(error) : resolve(result)
      }

      return this.logger.warn('Unknown request for', payload)
    }

    switch (payload.method) {
      case 'signalwire.ping':
        return this._pingHandler(payload)
      case 'signalwire.disconnect': {
        /**
         * Set this._status = 'idle' because the server
         * will close the connection soon.
         */
        this.execute(RPCDisconnectResponse(payload.id))
          .catch((error) => {
            this.logger.error('SwDisconnect Error', error)
          })
          .finally(() => {
            this._status = 'idle'
          })
        break
      }
      default:
        // If it's not a response, trigger the dispatch.
        this.dispatch(socketMessageAction(payload))
        this._handleWebSocketMessage(payload)
    }
  }

  protected _handleWebSocketMessage(
    _payload: JSONRPCRequest | JSONRPCResponse
  ) {
    // no-op
  }

  public dispatch(_payload: PayloadAction<any>) {
    throw new Error('Method not implemented')
  }

  /**
   * Check the current relayProtocol against the signature
   * to make sure is still valid.
   * @return boolean
   */
  protected _relayProtocolIsValid() {
    return (
      this.signature && this?.relayProtocol?.split('_')[1] === this.signature
    )
  }

  protected encode<T>(input: T): Parameters<WebSocketClient['send']>[0] {
    return JSON.stringify(input)
  }

  protected decode<T>(input: any): T {
    return safeParseJson(input)
  }

  private async _pingHandler(payload: JSONRPCRequest) {
    clearTimeout(this._checkPingTimer)
    this._checkPingTimer = setTimeout(() => {
      // Possibly half-open connection so force close our side
      this._closeConnection('reconnecting')
    }, this._checkPingDelay)

    await this.execute(RPCPingResponse(payload.id, payload?.params?.timestamp))
  }

  private _closeConnection(
    status: Extract<SessionStatus, 'reconnecting' | 'disconnected'>
  ) {
    this._status = status
    this.dispatch(sessionActions.authStatus('unknown'))
    this.dispatch(closeConnectionAction())
    if (this._socket) {
      this._socket.close()
      this._socket = null
    }
  }
}
