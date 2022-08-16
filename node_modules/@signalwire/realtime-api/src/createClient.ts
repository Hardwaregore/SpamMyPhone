import {
  ClientEvents,
  configureStore,
  connect,
  getEventEmitter,
  UserOptions,
  InternalUserOptions,
} from '@signalwire/core'
import { Client, RealtimeClient } from './Client'
import { Session } from './Session'

/** @internal */
export interface CreateClientOptions extends UserOptions {}
export type { RealtimeClient, ClientEvents }

/**
 * Creates a real-time Client.
 * @param userOptions
 * @param userOptions.project SignalWire project id, e.g. `a10d8a9f-2166-4e82-56ff-118bc3a4840f`
 * @param userOptions.token SignalWire project token, e.g. `PT9e5660c101cd140a1c93a0197640a369cf5f16975a0079c9`
 * @param userOptions.logLevel logging level
 * @returns an instance of a real-time Client.
 *
 * @example
 * ```typescript
 * const client = await createClient({
 *   project: '<project-id>',
 *   token: '<project-token>'
 * })
 * ```
 *
 * @deprecated You no longer need to create the client
 * manually. You can use the product constructors, like
 * {@link Video.Client}, to access the same functionality.
 */
export const createClient: (userOptions: {
  project?: string
  token: string
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'
}) => Promise<RealtimeClient> =
  // Note: types are inlined for clarity of documentation
  async (userOptions) => {
    const baseUserOptions: InternalUserOptions = {
      ...userOptions,
      emitter: getEventEmitter<ClientEvents>(),
    }
    const store = configureStore({
      userOptions: baseUserOptions,
      SessionConstructor: Session,
    })

    const client = connect<ClientEvents, Client, RealtimeClient>({
      store,
      Component: Client,
      componentListeners: {
        errors: 'onError',
        responses: 'onSuccess',
      },
      sessionListeners: {
        authStatus: 'onAuth',
      },
    })(baseUserOptions)

    return client
  }
