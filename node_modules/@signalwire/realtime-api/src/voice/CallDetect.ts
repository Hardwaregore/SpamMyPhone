import {
  connect,
  BaseComponent,
  BaseComponentOptions,
  VoiceCallDetectContract,
  Detector,
} from '@signalwire/core'

/**
 * Instances of this class allow you to control (e.g., resume) the
 * detect inside a Voice Call. You can obtain instances of this class by
 * starting a Detect from the desired {@link Call} (see
 * {@link Call.detect})
 */
export interface CallDetect extends VoiceCallDetectContract {}

export type CallDetectEventsHandlerMapping = {}

export interface CallDetectOptions
  extends BaseComponentOptions<CallDetectEventsHandlerMapping> {}

export class CallDetectAPI
  extends BaseComponent<CallDetectEventsHandlerMapping>
  implements VoiceCallDetectContract
{
  protected _eventsPrefix = 'calling' as const

  callId: string
  nodeId: string
  controlId: string
  detect?: Detector

  get id() {
    return this.controlId
  }

  get type() {
    return this?.detect?.type
  }

  async stop() {
    // if (this.state !== 'finished') {
    await this.execute({
      method: 'calling.detect.stop',
      params: {
        node_id: this.nodeId,
        call_id: this.callId,
        control_id: this.controlId,
      },
    })
    // }

    return this
  }

  waitForResult() {
    return new Promise<this>((resolve) => {
      this._attachListeners(this.controlId)

      // @ts-expect-error
      this.once('detect.ended', () => {
        resolve(this)
      })
    })
  }
}

export const createCallDetectObject = (
  params: CallDetectOptions
): CallDetect => {
  const detect = connect<
    CallDetectEventsHandlerMapping,
    CallDetectAPI,
    CallDetect
  >({
    store: params.store,
    Component: CallDetectAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return detect
}
