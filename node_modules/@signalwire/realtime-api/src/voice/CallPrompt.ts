import {
  connect,
  BaseComponentOptions,
  VoiceCallPromptContract,
  CallingCallCollectResult,
  EventTransform,
  toExternalJSON,
} from '@signalwire/core'
import { AutoApplyTransformsConsumer } from '../AutoApplyTransformsConsumer'

type EmitterTransformsEvents =
  | 'calling.prompt.started'
  | 'calling.prompt.updated'
  | 'calling.prompt.ended'
  | 'calling.prompt.failed'

/**
 * Instances of this class allow you to control (e.g., resume) the
 * prompt inside a Voice Call. You can obtain instances of this class by
 * starting a Prompt from the desired {@link Call} (see
 * {@link Call.prompt})
 */
export interface CallPrompt extends VoiceCallPromptContract {}

export type CallPromptEventsHandlerMapping = {}

export interface CallPromptOptions
  extends BaseComponentOptions<CallPromptEventsHandlerMapping> {}

export class CallPromptAPI
  extends AutoApplyTransformsConsumer<CallPromptEventsHandlerMapping>
  implements VoiceCallPromptContract
{
  protected _eventsPrefix = 'calling' as const

  callId: string
  nodeId: string
  controlId: string
  result?: CallingCallCollectResult

  /** @internal */
  protected getEmitterTransforms() {
    return new Map<
      EmitterTransformsEvents | EmitterTransformsEvents[],
      EventTransform
    >([
      [
        ['calling.prompt.ended', 'calling.prompt.failed'],
        {
          type: 'voiceCallPrompt',
          instanceFactory: (_payload: any) => {
            return createCallPromptObject({
              store: this.store,
              emitter: this.emitter,
            })
          },
          payloadTransform: (payload: any) => {
            return toExternalJSON(payload)
          },
        },
      ],
    ])
  }

  get id() {
    return this.controlId
  }

  get type() {
    return this.result?.type
  }

  /**
   * User-friendly alias to understand the reason in case of errors
   * no_match | no_input | error
   */
  get reason() {
    return this.type
  }

  get digits() {
    if (this.result?.type === 'digit') {
      return this.result.params.digits
    }
    return undefined
  }

  get terminator() {
    if (this.result?.type === 'digit') {
      return this.result.params.terminator
    }
    return undefined
  }

  get text() {
    if (this.result?.type === 'speech') {
      return this.result.params.text
    }
    return undefined
  }

  get confidence() {
    if (this.result?.type === 'speech') {
      return this.result.params.confidence
    }
    return undefined
  }

  async stop() {
    // Execute stop only if we don't have result yet
    if (!this.result) {
      await this.execute({
        method: 'calling.play_and_collect.stop',
        params: {
          node_id: this.nodeId,
          call_id: this.callId,
          control_id: this.controlId,
        },
      })
    }

    /**
     * TODO: we should wait for the prompt to be finished to allow
     * the CallPrompt/Proxy object to update the payload properly
     */

    return this
  }

  async setVolume(volume: number): Promise<this> {
    await this.execute({
      method: 'calling.play_and_collect.volume',
      params: {
        node_id: this.nodeId,
        call_id: this.callId,
        control_id: this.controlId,
        volume,
      },
    })

    return this
  }

  waitForResult() {
    return new Promise<CallPrompt>((resolve) => {
      this._attachListeners(this.controlId)

      const handler = (callPrompt: CallPrompt) => {
        // @ts-expect-error
        this.off('prompt.ended', handler)
        // @ts-expect-error
        this.off('prompt.failed', handler)

        resolve(callPrompt)
      }

      // @ts-expect-error
      this.once('prompt.ended', handler)
      // @ts-expect-error
      this.once('prompt.failed', handler)
    })
  }
}

export const createCallPromptObject = (
  params: CallPromptOptions
): CallPrompt => {
  const record = connect<
    CallPromptEventsHandlerMapping,
    CallPromptAPI,
    CallPrompt
  >({
    store: params.store,
    Component: CallPromptAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return record
}
