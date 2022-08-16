import {
  connect,
  BaseComponentOptions,
  toExternalJSON,
  ClientContextContract,
} from '@signalwire/core'
import type {
  DisconnectableClientContract,
  EventTransform,
  CallingCallReceiveEventParams,
  VoiceDeviceBuilder,
  VoiceCallDialPhoneMethodParams,
  VoiceCallDialSipMethodParams,
} from '@signalwire/core'
import { RealtimeClient } from '../client/index'
import { createCallObject, Call } from './Call'
import { voiceCallReceiveWorker } from './workers'
import { DeviceBuilder } from './DeviceBuilder'
import type { RealTimeCallApiEvents } from '../types'
import { AutoApplyTransformsConsumer } from '../AutoApplyTransformsConsumer'

export * from './VoiceClient'
export { Call } from './Call'
export type { RealTimeCallApiEvents }
export { DeviceBuilder }
export { Playlist } from './Playlist'
export type { CallPlayback } from './CallPlayback'
export type { CallPrompt } from './CallPrompt'
export type { CallRecording } from './CallRecording'
export type { CallTap } from './CallTap'
export type {
  CallingCallDirection,
  CallingCallState,
  CallingCallWaitForState,
  ClientEvents,
  CollectDigitsConfig,
  CollectSpeechConfig,
  CreateVoicePlaylistParams,
  NestedArray,
  RingtoneName,
  SipCodec,
  SipHeader,
  SpeechOrDigits,
  TapDevice,
  TapDeviceRTP,
  TapDeviceWS,
  TapDirection,
  VoiceCallConnectMethodParams,
  VoiceCallConnectPhoneMethodParams,
  VoiceCallConnectSipMethodParams,
  VoiceCallContract,
  VoiceCallDetectContract,
  VoiceCallDetectDigitParams,
  VoiceCallDetectFaxParams,
  VoiceCallDetectMachineParams,
  VoiceCallDetectMethodParams,
  VoiceCallDeviceParams,
  VoiceCallDialPhoneMethodParams,
  VoiceCallDialRegionParams,
  VoiceCallDialSipMethodParams,
  VoiceCallDisconnectReason,
  VoiceCallPhoneParams,
  VoiceCallPlayAudioMethodParams,
  VoiceCallPlayAudioParams,
  VoiceCallPlaybackContract,
  VoiceCallPlayParams,
  VoiceCallPlayRingtoneMethodParams,
  VoiceCallPlayRingtoneParams,
  VoiceCallPlaySilenceMethodParams,
  VoiceCallPlaySilenceParams,
  VoiceCallPlayTTSMethodParams,
  VoiceCallPlayTTSParams,
  VoiceCallPromptAudioMethodParams,
  VoiceCallPromptContract,
  VoiceCallPromptMethodParams,
  VoiceCallPromptRingtoneMethodParams,
  VoiceCallPromptTTSMethodParams,
  VoiceCallRecordingContract,
  VoiceCallRecordMethodParams,
  VoiceCallSipParams,
  VoiceCallTapAudioMethodParams,
  VoiceCallTapContract,
  VoiceCallTapMethodParams,
  VoiceDeviceBuilder,
  VoiceDialerParams,
  VoicePlaylist,
} from '@signalwire/core'

/**
 * List of events for {@link Voice.Call}.
 */
export interface VoiceClientApiEvents extends RealTimeCallApiEvents {}

type EmitterTransformsEvents = 'calling.call.received'

export interface Voice
  extends DisconnectableClientContract<Voice, VoiceClientApiEvents>,
    ClientContextContract {
  /** @internal */
  _session: RealtimeClient
  /**
   * Makes an outbound Call and waits until it has been answered or hung up.
   * This is an advanced method that lets you call multiple devices in parallel
   * or series: for simpler use cases, see {@link dialPhone} and
   * {@link dialSip}.
   *
   * With this method you can specify a configuration of devices to call in
   * series and/or in parallel: as soon as one device answers the call, the
   * returned promise is resolved. You specify a configuration through a
   * {@link VoiceDeviceBuilder} object.
   *
   * @param dialer - {@link VoiceDeviceBuilder}
   *
   * @example Calls a phone number. If the number doesn't answer within 30
   * seconds, calls two different SIP endpoints in parallel.
   *
   * ```js
   * const devices = new Voice.DeviceBuilder()
   *   .add(Voice.DeviceBuilder.Phone({ from: '+XXXXXX', to: '+YYYYYY', timeout: 30 }))
   *   .add([
   *     Voice.DeviceBuilder.Sip({ from: 'sip:aaa@bbb.cc', to: 'sip:xxx@yyy.zz' }),
   *     Voice.DeviceBuilder.Sip({ from: 'sip:aaa@bbb.cc', to: 'sip:ppp@qqq.rr' })
   *   ])
   *
   * try {
   *   const call = await client.dial(devices)
   *   console.log("Call answered")
   * } catch (e) {
   *   console.log("Call not answered")
   * }
   * ```
   *
   * @param dialer The Dialer specifying the devices to call.
   *
   * @returns A call object.
   */
  dial(dialer: VoiceDeviceBuilder): Promise<Call>
  /**
   * Makes an outbound call to a PSTN number.
   *
   * @param params - {@link VoiceCallDialPhoneMethodParams}
   *
   * @example
   *
   * ```js
   * try {
   *   const call = await client.dialPhone({
   *     from: '+YYYYYYYYYY',
   *     to: '+XXXXXXXXXX',
   *     timeout: 30,
   *   })
   * } catch (e) {
   *   console.log("Call not answered.")
   * }
   * ```
   *
   * @returns A call object.
   */
  dialPhone(params: VoiceCallDialPhoneMethodParams): Promise<Call>
  /**
   * Makes an outbound call to a SIP endpoint.
   *
   * @param params - {@link VoiceCallDialSipMethodParams}
   *
   * @example
   *
   * ```js
   * try {
   *   const call = await client.dialPhone({
   *     from: 'sip:xxx@yyy.zz',
   *     to: 'sip:ppp@qqq.rr',
   *     timeout: 30,
   *   })
   * } catch (e) {
   *   console.log("Call not answered.")
   * }
   * ```
   *
   * @returns A call object.
   */
  dialSip(params: VoiceCallDialSipMethodParams): Promise<Call>
}

/** @internal */
class VoiceAPI extends AutoApplyTransformsConsumer<VoiceClientApiEvents> {
  /** @internal */
  protected _eventsPrefix = 'calling' as const

  constructor(options: BaseComponentOptions<VoiceClientApiEvents>) {
    super(options)

    this.runWorker('voiceCallReceiveWorker', {
      worker: voiceCallReceiveWorker,
    })

    this._attachListeners('')
  }

  /** @internal */
  protected getEmitterTransforms() {
    return new Map<
      EmitterTransformsEvents | EmitterTransformsEvents[],
      EventTransform
    >([
      [
        'calling.call.received',
        {
          mode: 'no-cache',
          type: 'voiceCallReceived',
          instanceFactory: (_payload: any) => {
            return createCallObject({
              store: this.store,
              // @ts-expect-error
              emitter: this.emitter,
            })
          },
          payloadTransform: (payload: CallingCallReceiveEventParams) => {
            return toExternalJSON(payload)
          },
        },
      ],
    ])
  }

  dialPhone({ region, ...params }: VoiceCallDialPhoneMethodParams) {
    const devices = new DeviceBuilder().add(DeviceBuilder.Phone(params))
    // dial is available through the VoiceClient Proxy
    // @ts-expect-error
    return this.dial({
      region,
      devices,
    })
  }

  dialSip({ region, ...params }: VoiceCallDialSipMethodParams) {
    const devices = new DeviceBuilder().add(DeviceBuilder.Sip(params))
    // dial is available through the VoiceClient Proxy
    // @ts-expect-error
    return this.dial({
      region,
      devices,
    })
  }
}

/** @internal */
export const createVoiceObject = (
  params: BaseComponentOptions<VoiceClientApiEvents>
): Voice => {
  const voice = connect<VoiceClientApiEvents, VoiceAPI, Voice>({
    store: params.store,
    Component: VoiceAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return voice
}
