import { destroyAction, initAction } from './redux'
import { BaseClientOptions } from './utils/interfaces'
import { BaseComponent } from './BaseComponent'
import { EventEmitter } from './utils/EventEmitter'
import { getAuthStatus } from './redux/features/session/sessionSelectors'

export class BaseClient<
  EventTypes extends EventEmitter.ValidEventTypes
> extends BaseComponent<EventTypes> {
  constructor(public options: BaseClientOptions<EventTypes>) {
    super(options)
    /**
     * Since we don't need a namespace for these events
     * we'll attach them as soon as the Client has been
     * registered in the Redux store.
     */
    this._attachListeners('')
  }

  /**
   * Connect the underlay WebSocket connection to the SignalWire network.
   *
   * @returns Promise that will resolve with the Client object.
   */
  connect(): Promise<this> {
    const authStatus = getAuthStatus(this.store.getState())

    if (authStatus === 'unknown' || authStatus === 'unauthorized') {
      this.store.dispatch(initAction())
    }

    return this._waitUntilSessionAuthorized()
  }

  /**
   * Disconnect the Client from the SignalWire network.
   */
  disconnect() {
    this.store.dispatch(destroyAction())
  }
}
