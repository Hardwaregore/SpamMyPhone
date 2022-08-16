import type {
  VoiceDeviceBuilder,
  VoiceCallDeviceParams,
  VoiceCallPhoneParams,
  VoiceCallDialPhoneMethodParams,
  VoiceCallSipParams,
  VoiceCallDialSipMethodParams,
} from '@signalwire/core'

/**
 * A DeviceBuilder object allows you to specify a set of devices which should be
 * dialed in sequence or parallel. You can then pass the device plan to the
 * methods that support it, for example {@link Call.connect}.
 *
 * @example
 *
 * Creates a plan which specifies to dial a SIP endpoint. If there is no answer
 * within 30 seconds, calls two phone numbers in parallel (as indicated by the
 * array syntax). As soon as one of the two answers, the operation is
 * considered successful.
 *
 * ```js
 * const plan = new Voice.DeviceBuilder()
 *   .add(Voice.DeviceBuilder.Sip({
 *     from: 'sip:user1@domain.com',
 *     to: 'sip:user2@domain.com',
 *     timeout: 30,
 *   }))
 *   .add([
 *     Voice.DeviceBuilder.Phone({ to: '+yyyyyy', timeout: 30 }),
 *     Voice.DeviceBuilder.Phone({ to: '+zzzzzz', timeout: 30 })
 *   ])
 * ```
 */
export class DeviceBuilder implements VoiceDeviceBuilder {
  private _devices: VoiceDeviceBuilder['devices'] = []

  get devices() {
    return this._devices
  }

  add(params: VoiceCallDeviceParams | VoiceCallDeviceParams[]) {
    if (Array.isArray(params)) {
      this._devices.push(params)
    } else {
      this._devices.push([params])
    }

    return this
  }

  static Phone(params: VoiceCallDialPhoneMethodParams): VoiceCallPhoneParams {
    return { type: 'phone', ...params }
  }

  static Sip(params: VoiceCallDialSipMethodParams): VoiceCallSipParams {
    return { type: 'sip', ...params }
  }
}
