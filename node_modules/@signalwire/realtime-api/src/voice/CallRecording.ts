import {
  connect,
  BaseComponent,
  BaseComponentOptions,
  VoiceCallRecordingContract,
  CallingCallRecordState,
} from '@signalwire/core'

/**
 * Instances of this class allow you to control (e.g., resume) the
 * recording inside a Voice Call. You can obtain instances of this class by
 * starting a recording from the desired {@link Call} (see
 * {@link Call.record})
 */
export interface CallRecording extends VoiceCallRecordingContract {}

export type CallRecordingEventsHandlerMapping = {}

export interface CallRecordingOptions
  extends BaseComponentOptions<CallRecordingEventsHandlerMapping> {}

export class CallRecordingAPI
  extends BaseComponent<CallRecordingEventsHandlerMapping>
  implements VoiceCallRecordingContract
{
  callId: string
  nodeId: string
  controlId: string
  state: CallingCallRecordState

  get id() {
    return this.controlId
  }

  async stop() {
    await this.execute({
      method: 'calling.record.stop',
      params: {
        node_id: this.nodeId,
        call_id: this.callId,
        control_id: this.controlId,
      },
    })

    /**
     * TODO: we should wait for the recording `finished` event to allow
     * the CallRecording/Proxy object to update the payload properly
     */

    return this
  }
}

export const createCallRecordingObject = (
  params: CallRecordingOptions
): CallRecording => {
  const record = connect<
    CallRecordingEventsHandlerMapping,
    CallRecordingAPI,
    CallRecording
  >({
    store: params.store,
    Component: CallRecordingAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return record
}
