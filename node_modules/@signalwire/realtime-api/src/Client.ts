import {
  BaseClient,
  EventsPrefix,
  SessionState,
  ClientContract,
  ClientEvents,
} from '@signalwire/core'
import { createVideoObject, Video } from './video/Video'

/**
 * A real-time Client.
 *
 * To construct an instance of this class, please use {@link createClient}.
 *
 * Example usage:
 * ```typescript
 * import {createClient} from '@signalwire/realtime-api'
 *
 * // Obtain a client:
 * const client = await createClient({ project, token })
 *
 * // Listen on events:
 * client.video.on('room.started', async (room) => { })
 *
 * // Connect:
 * await client.connect()
 * ```
 * @deprecated It's no longer needed to create the client
 * manually. You can use the product constructors, like
 * Video.Client, to access the same functionality.
 */
export interface RealtimeClient
  extends ClientContract<RealtimeClient, ClientEvents> {
  /**
   * Connects this client to the SignalWire network.
   *
   * As a general best practice, it is suggested to connect the event listeners
   * *before* connecting the client, so that no events are lost.
   *
   * @returns Upon connection, asynchronously returns an instance of this same
   * object.
   *
   * @example
   * ```typescript
   * const client = await createClient({project, token})
   * client.video.on('room.started', async (roomSession) => { })  // connect events
   * await client.connect()
   * ```
   */
  connect(): Promise<RealtimeClient>

  /**
   * Disconnects this client from the SignalWire network.
   */
  disconnect(): void

  /**
   * Access the Video API Consumer
   */
  video: Video
}

type ClientNamespaces = Video

export class Client extends BaseClient<ClientEvents> {
  private _consumers: Map<EventsPrefix, ClientNamespaces> = new Map()

  async onAuth(session: SessionState) {
    try {
      if (session.authStatus === 'authorized') {
        this._consumers.forEach((consumer) => {
          consumer.subscribe()
        })
      }
    } catch (error) {
      this.logger.error('Client subscription failed.')
      this.disconnect()

      /**
       * TODO: This error is not being catched by us so it's
       * gonna appear as `UnhandledPromiseRejectionWarning`.
       * The reason we are re-throwing here is because if
       * this happens something serious happened and the app
       * won't work anymore since subscribes aren't working.
       */
      throw error
    }
  }

  get video(): Video {
    if (this._consumers.has('video')) {
      return this._consumers.get('video')!
    }
    const video = createVideoObject({
      store: this.store,
      // Emitter is now typed but we share it across objects
      // so types won't match
      // @ts-expect-error
      emitter: this.options.emitter,
    })
    this._consumers.set('video', video)
    return video
  }
}
