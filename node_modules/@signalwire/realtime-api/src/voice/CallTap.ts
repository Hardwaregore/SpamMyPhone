import {
  connect,
  BaseComponent,
  BaseComponentOptions,
  VoiceCallTapContract,
  CallingCallTapState,
} from '@signalwire/core'

/**
 * Instances of this class allow you to control (e.g., resume) the
 * tap inside a Voice Call. You can obtain instances of this class by
 * starting a Tap from the desired {@link Call} (see
 * {@link Call.tap})
 */
export interface CallTap extends VoiceCallTapContract {}

export type CallTapEventsHandlerMapping = {}

export interface CallTapOptions
  extends BaseComponentOptions<CallTapEventsHandlerMapping> {}

export class CallTapAPI
  extends BaseComponent<CallTapEventsHandlerMapping>
  implements VoiceCallTapContract
{
  callId: string
  nodeId: string
  controlId: string
  state: CallingCallTapState

  get id() {
    return this.controlId
  }

  async stop() {
    if (this.state !== 'finished') {
      await this.execute({
        method: 'calling.tap.stop',
        params: {
          node_id: this.nodeId,
          call_id: this.callId,
          control_id: this.controlId,
        },
      })
    }

    return this
  }
}

export const createCallTapObject = (params: CallTapOptions): CallTap => {
  const tap = connect<CallTapEventsHandlerMapping, CallTapAPI, CallTap>({
    store: params.store,
    Component: CallTapAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return tap
}
