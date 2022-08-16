import type { SwEvent } from '.'
import { MapToPubSubShape } from '..'
import { PRODUCT_PREFIX_VOICE_CALL } from '../utils/constants'
import type {
  CamelToSnakeCase,
  OnlyFunctionProperties,
  OnlyStateProperties,
} from './utils'

type ToInternalVoiceEvent<T extends string> = `${VoiceNamespace}.${T}`
export type VoiceNamespace = typeof PRODUCT_PREFIX_VOICE_CALL
export type RingtoneName =
  | 'at'
  | 'au'
  | 'bg'
  | 'br'
  | 'be'
  | 'ch'
  | 'cl'
  | 'cn'
  | 'cz'
  | 'de'
  | 'dk'
  | 'ee'
  | 'es'
  | 'fi'
  | 'fr'
  | 'gr'
  | 'hu'
  | 'il'
  | 'in'
  | 'it'
  | 'lt'
  | 'jp'
  | 'mx'
  | 'my'
  | 'nl'
  | 'no'
  | 'nz'
  | 'ph'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'se'
  | 'sg'
  | 'th'
  | 'uk'
  | 'us'
  | 'tw'
  | 've'
  | 'za'
/**
 * Private event types
 */
export type CallDial = 'call.dial'
export type CallState = 'call.state'
export type CallReceive = 'call.receive'
export type CallPlay = 'call.play'
export type CallRecord = 'call.record'
export type CallCollect = 'call.collect'
export type CallTap = 'call.tap'
export type CallConnect = 'call.connect'
export type CallSendDigits = 'call.send_digits'
export type CallDetect = 'call.detect'

/**
 * Public event types
 */
export type CallCreated = 'call.created'
export type CallEnded = 'call.ended'
export type CallReceived = 'call.received'
export type CallPlaybackStarted = 'playback.started'
export type CallPlaybackUpdated = 'playback.updated'
export type CallPlaybackEnded = 'playback.ended'
export type CallRecordingStarted = 'recording.started'
export type CallRecordingUpdated = 'recording.updated'
export type CallRecordingEnded = 'recording.ended'
export type CallRecordingFailed = 'recording.failed'
export type CallPromptStarted = 'prompt.started'
export type CallPromptUpdated = 'prompt.updated'
export type CallPromptEnded = 'prompt.ended'
export type CallPromptFailed = 'prompt.failed'
export type CallTapStarted = 'tap.started'
export type CallTapEnded = 'tap.ended'
// Not exposed yet to the public-side
export type CallConnectConnecting = 'connect.connecting'
export type CallConnectConnected = 'connect.connected'
export type CallConnectDisconnected = 'connect.disconnected'
export type CallConnectFailed = 'connect.failed'
export type CallDetectStarted = 'detect.started'
export type CallDetectUpdated = 'detect.updated'
export type CallDetectEnded = 'detect.ended'

/**
 * List of public event names
 */
export type VoiceCallEventNames =
  | CallCreated
  | CallEnded
  | CallPlaybackStarted
  | CallPlaybackUpdated
  | CallPlaybackEnded
  | CallRecordingStarted
  | CallRecordingUpdated
  | CallRecordingEnded
  | CallRecordingFailed
  | CallPromptStarted
  | CallPromptUpdated
  | CallPromptEnded
  | CallPromptFailed
  | CallTapStarted
  | CallTapEnded
  | CallConnectConnecting
  | CallConnectConnected
  | CallConnectDisconnected
  | CallConnectFailed
  | CallDetectStarted
  | CallDetectUpdated
  | CallDetectEnded

/**
 * List of internal events
 * @internal
 */
// export type InternalVoiceCallEventNames =
//   ToInternalVoiceEvent<VoiceCallEventNames>

export type SipCodec =
  | 'PCMU'
  | 'PCMA'
  | 'OPUS'
  | 'G729'
  | 'G722'
  | 'VP8'
  | 'H264'

export interface SipHeader {
  name: string
  value: string
}

export interface VoiceCallPhoneParams {
  type: 'phone'
  from?: string
  to: string
  timeout?: number
}

export type OmitType<T> = Omit<T, 'type'>

export interface VoiceCallSipParams {
  type: 'sip'
  from: string
  to: string
  timeout?: number
  headers?: SipHeader[]
  codecs?: SipCodec[]
  webrtcMedia?: boolean
}

export interface NestedArray<T> extends Array<T | NestedArray<T>> {}

export type VoiceCallDeviceParams = VoiceCallPhoneParams | VoiceCallSipParams

export interface VoiceCallDialMethodParams {
  region?: string
  devices: NestedArray<VoiceCallDeviceParams>
}

export interface VoiceCallPlayAudioParams {
  type: 'audio'
  url: string
}

export interface VoiceCallPlayTTSParams {
  type: 'tts'
  text: string
  language?: string
  gender?: 'male' | 'female'
}

export interface VoiceCallPlaySilenceParams {
  type: 'silence'
  duration: number
}

export interface VoiceCallPlayRingtoneParams {
  type: 'ringtone'
  name: RingtoneName
  duration?: number
}

export type VoiceCallPlayParams =
  | VoiceCallPlayAudioParams
  | VoiceCallPlayTTSParams
  | VoiceCallPlaySilenceParams
  | VoiceCallPlayRingtoneParams

export interface VoiceCallPlayMethodParams {
  media: NestedArray<VoiceCallPlayParams>
  volume?: number
}

export interface VoiceCallPlayAudioMethodParams
  extends OmitType<VoiceCallPlayAudioParams> {
  volume?: number
}

export interface VoicePlaylistAudioParams
  extends OmitType<VoiceCallPlayAudioParams> {}

export interface VoiceCallPlaySilenceMethodParams
  extends OmitType<VoiceCallPlaySilenceParams> {}

export interface VoicePlaylistSilenceParams
  extends OmitType<VoiceCallPlaySilenceParams> {}

export interface VoiceCallPlayRingtoneMethodParams
  extends OmitType<VoiceCallPlayRingtoneParams> {
  volume?: number
}
export interface VoicePlaylistRingtoneParams
  extends OmitType<VoiceCallPlayRingtoneParams> {
}

export interface VoiceCallPlayTTSMethodParams
  extends OmitType<VoiceCallPlayTTSParams> {
  volume?: number
}
export interface VoicePlaylistTTSParams
  extends OmitType<VoiceCallPlayTTSParams> {
}

export interface VoiceCallRecordMethodParams {
  audio: {
    beep?: boolean
    format?: 'mp3' | 'wav'
    stereo?: boolean
    direction?: 'listen' | 'speak' | 'both'
    initialTimeout?: number
    endSilenceTimeout?: number
    terminators?: string
  }
}

export type CollectDigitsConfig = {
  /** Max number of digits to collect. */
  max: number
  /** Timeout in seconds between each digit. */
  digitTimeout?: number
  /** DTMF digits that will end the collection. Default not set. */
  terminators?: string
}

export type CollectSpeechConfig = {
  /** How much silence to wait for end of speech. Default to 1 second. */
  endSilenceTimeout?: number
  /** Maximum time to collect speech. Default to 60 seconds. */
  speechTimeout?: number
  /** Language to detect. Default to `en-US`. */
  language?: number
  /** Array of expected phrases to detect. */
  hints?: string[]
}

export type SpeechOrDigits =
  | {
      digits: CollectDigitsConfig
      speech?: never
    }
  | {
      digits?: never
      speech: CollectSpeechConfig
    }
export type VoiceCallPromptMethodParams = SpeechOrDigits & {
  playlist: VoicePlaylist
  initialTimeout?: number
  partialResults?: boolean
}
export type VoiceCallPromptAudioMethodParams = SpeechOrDigits &
  OmitType<VoiceCallPlayAudioParams> & {
    volume?: number
    initialTimeout?: number
    partialResults?: boolean
  }
export type VoiceCallPromptRingtoneMethodParams = SpeechOrDigits &
  OmitType<VoiceCallPlayRingtoneParams> & {
    volume?: number
    initialTimeout?: number
    partialResults?: boolean
  }
export type VoiceCallPromptTTSMethodParams = SpeechOrDigits &
  OmitType<VoiceCallPlayTTSParams> & {
    volume?: number
    initialTimeout?: number
    partialResults?: boolean
  }
type TapCodec = 'OPUS' | 'PCMA' | 'PCMU'
export interface TapDeviceWS {
  type: 'ws'
  uri: string
  codec?: TapCodec
  rate?: number
}

export interface TapDeviceRTP {
  type: 'rtp'
  addr: string
  port: string
  codec?: TapCodec
  ptime?: number
}

export type TapDevice = TapDeviceWS | TapDeviceRTP
export type TapDirection = 'listen' | 'speak' | 'both'
export interface VoiceCallTapMethodParams {
  device: TapDevice
  audio: {
    direction: TapDirection
  }
}

export interface VoiceCallTapAudioMethodParams {
  device: TapDevice
  direction: TapDirection
}

export type VoiceCallConnectMethodParams =
  | VoiceDeviceBuilder
  | {
      devices: VoiceDeviceBuilder
      ringback?: VoicePlaylist
    }

export type VoiceCallConnectPhoneMethodParams =
  OmitType<VoiceCallPhoneParams> & { ringback?: VoicePlaylist }
export type VoiceCallConnectSipMethodParams = OmitType<VoiceCallSipParams> & {
  ringback?: VoicePlaylist
}

interface VoiceCallDetectBaseParams {
  timeout?: number
  waitForBeep?: boolean // SDK-side only
}

export interface VoiceCallDetectMachineParams
  extends VoiceCallDetectBaseParams {
  type: 'machine'
  initialTimeout?: number
  endSilenceTimeout?: number
  machineVoiceThreshold?: number
  machineWordsThreshold?: number
}

export interface VoiceCallDetectFaxParams extends VoiceCallDetectBaseParams {
  type: 'fax'
  tone?: 'CED' | 'CNG'
}

export interface VoiceCallDetectDigitParams extends VoiceCallDetectBaseParams {
  type: 'digit'
  digits?: string
}

export type VoiceCallDetectMethodParams =
  | VoiceCallDetectMachineParams
  | VoiceCallDetectFaxParams
  | VoiceCallDetectDigitParams

export type VoiceCallDisconnectReason =
  | 'hangup'
  | 'cancel'
  | 'busy'
  | 'noAnswer'
  | 'decline'
  | 'error'

export interface VoiceCallDialRegionParams {
  region?: VoiceRegion
}

export type VoiceCallDialPhoneMethodParams = OmitType<VoiceCallPhoneParams> &
  VoiceCallDialRegionParams
export type VoiceCallDialSipMethodParams = OmitType<VoiceCallSipParams> &
  VoiceCallDialRegionParams

type VoiceRegion = string

export type VoiceDialerParams =
  | VoiceDeviceBuilder
  | ({
      devices: VoiceDeviceBuilder
    } & VoiceCallDialRegionParams)

export interface VoiceDeviceBuilder {
  devices: VoiceCallDialMethodParams['devices']
  add(params: VoiceCallDeviceParams | VoiceCallDeviceParams[]): this
}

export interface CreateVoicePlaylistParams {
  /** Default volume for the audio in the playlist. */
  volume?: number
}

export interface VoicePlaylist extends CreateVoicePlaylistParams {
  media: VoiceCallPlayMethodParams['media']
  add(params: VoiceCallPlayParams): this
}

/**
 * Public Contract for a VoiceCall
 */
export interface VoiceCallPlaybackContract {
  /** Unique id for this playback */
  readonly id: string
  /** @ignore */
  readonly callId: string
  /** @ignore */
  readonly controlId: string
  /** @ignore */
  readonly volume: number
  /** @ignore */
  readonly state: CallingCallPlayState

  pause(): Promise<this>
  resume(): Promise<this>
  stop(): Promise<this>
  setVolume(volume: number): Promise<this>
  waitForEnded(): Promise<this>
}

/**
 * VoiceCallPlayback properties
 */
export type VoiceCallPlaybackEntity =
  OnlyStateProperties<VoiceCallPlaybackContract>

/**
 * VoiceCallPlayback methods
 */
export type VoiceCallPlaybackMethods =
  OnlyFunctionProperties<VoiceCallPlaybackContract>

/**
 * Public Contract for a VoiceCallRecording
 */
export interface VoiceCallRecordingContract {
  /** Unique id for this recording */
  readonly id: string
  /** @ignore */
  readonly callId: string
  /** @ignore */
  readonly controlId: string
  /** @ignore */
  readonly state?: CallingCallRecordState
  /** @ignore */
  readonly url?: string
  /** @ignore */
  readonly size?: number
  /** @ignore */
  readonly duration?: number

  stop(): Promise<this>
}

/**
 * VoiceCallRecording properties
 */
export type VoiceCallRecordingEntity =
  OnlyStateProperties<VoiceCallRecordingContract>

/**
 * VoiceCallRecording methods
 */
export type VoiceCallRecordingMethods =
  OnlyFunctionProperties<VoiceCallRecordingContract>

/**
 * Public Contract for a VoiceCallDetect
 */
export interface VoiceCallDetectContract {
  /** Unique id for this detection */
  readonly id: string
  /** @ignore */
  readonly callId: string
  /** @ignore */
  readonly controlId: string
  /** @ignore The result of the detection. */
  readonly type?: CallingCallDetectType

  stop(): Promise<this>
  waitForResult(): Promise<this>
}

/**
 * VoiceCallDetect properties
 */
export type VoiceCallDetectEntity = OnlyStateProperties<VoiceCallDetectContract>

/**
 * VoiceCallDetect methods
 */
export type VoiceCallDetectMethods =
  OnlyFunctionProperties<VoiceCallDetectContract>

/**
 * Public Contract for a VoiceCallPrompt
 */
export interface VoiceCallPromptContract {
  /** Unique id for this recording */
  readonly id: string
  /** @ignore */
  readonly callId: string
  /** @ignore */
  readonly controlId: string

  readonly type?: CallingCallCollectResult['type']
  /** Alias for type in case of errors */
  readonly reason?: string
  readonly digits?: string
  readonly terminator?: string
  readonly text?: string
  readonly confidence?: number

  stop(): Promise<this>
  setVolume(volume: number): Promise<this>
  waitForResult(): Promise<VoiceCallPromptContract>
}

/**
 * VoiceCallPrompt properties
 */
export type VoiceCallPromptEntity = OnlyStateProperties<VoiceCallPromptContract>

/**
 * VoiceCallPrompt methods
 */
export type VoiceCallPromptMethods =
  OnlyFunctionProperties<VoiceCallPromptContract>

/**
 * Public Contract for a VoiceCallTap
 */
export interface VoiceCallTapContract {
  /** Unique id for this recording */
  readonly id: string
  /** @ignore */
  readonly callId: string
  /** @ignore */
  readonly controlId: string
  /** @ignore */
  readonly state: CallingCallTapState

  stop(): Promise<this>
}

/**
 * VoiceCallTap properties
 */
export type VoiceCallTapEntity = OnlyStateProperties<VoiceCallTapContract>

/**
 * VoiceCallTap methods
 */
export type VoiceCallTapMethods = OnlyFunctionProperties<VoiceCallTapContract>

export type CallingCallWaitForState = Extract<
  CallingCallState,
  'ending' | 'ended'
>

/**
 * Public Contract for a VoiceCall
 */
export interface VoiceCallContract<T = any> {
  /** Unique id for this voice call */
  readonly id: string
  /** @ignore */
  tag: string
  /** @ignore */
  callId: string
  /** @ignore */
  nodeId: string
  /** @ignore */
  state: CallingCallState
  /** @ignore */
  context?: string

  type: 'phone' | 'sip'
  device: any // FIXME:
  from: string
  to: string
  direction: CallingCallDirection
  headers?: SipHeader[]

  dial(params: VoiceDialerParams): Promise<T>
  hangup(reason?: VoiceCallDisconnectReason): Promise<void>
  answer(): Promise<T>
  play(params: VoicePlaylist): Promise<VoiceCallPlaybackContract>
  playAudio(
    params: VoiceCallPlayAudioMethodParams
  ): Promise<VoiceCallPlaybackContract>
  playSilence(
    params: VoiceCallPlaySilenceMethodParams
  ): Promise<VoiceCallPlaybackContract>
  playRingtone(
    params: VoiceCallPlayRingtoneMethodParams
  ): Promise<VoiceCallPlaybackContract>
  playTTS(
    params: VoiceCallPlayTTSMethodParams
  ): Promise<VoiceCallPlaybackContract>
  record(
    params: VoiceCallRecordMethodParams
  ): Promise<VoiceCallRecordingContract>
  recordAudio(
    params?: VoiceCallRecordMethodParams['audio']
  ): Promise<VoiceCallRecordingContract>
  prompt(params: VoiceCallPromptMethodParams): Promise<VoiceCallPromptContract>
  promptAudio(
    params: VoiceCallPromptAudioMethodParams
  ): Promise<VoiceCallPromptContract>
  promptRingtone(
    params: VoiceCallPromptRingtoneMethodParams
  ): Promise<VoiceCallPromptContract>
  promptTTS(
    params: VoiceCallPromptTTSMethodParams
  ): Promise<VoiceCallPromptContract>
  // TODO: add derived prompt methods
  sendDigits(digits: string): Promise<T>
  tap(params: VoiceCallTapMethodParams): Promise<VoiceCallTapContract>
  tapAudio(params: VoiceCallTapAudioMethodParams): Promise<VoiceCallTapContract>
  connect(params: VoiceCallConnectMethodParams): Promise<VoiceCallContract>
  connectPhone(
    params: VoiceCallConnectPhoneMethodParams
  ): Promise<VoiceCallContract>
  connectSip(
    params: VoiceCallConnectSipMethodParams
  ): Promise<VoiceCallContract>
  waitForDisconnected(): Promise<this>
  waitFor(
    params: CallingCallWaitForState | CallingCallWaitForState[]
  ): Promise<boolean>
  disconnect(): Promise<void>
  detect(params: VoiceCallDetectMethodParams): Promise<VoiceCallDetectContract>
  amd(
    params?: Omit<VoiceCallDetectMachineParams, 'type'>
  ): Promise<VoiceCallDetectContract>
  detectFax(
    params?: Omit<VoiceCallDetectFaxParams, 'type'>
  ): Promise<VoiceCallDetectContract>
  detectDigit(
    params?: Omit<VoiceCallDetectDigitParams, 'type'>
  ): Promise<VoiceCallDetectContract>
}

/**
 * VoiceCall properties
 */
export type VoiceCallEntity = OnlyStateProperties<VoiceCallContract>
/**
 * VoiceCall methods
 */
export type VoiceCallMethods = OnlyFunctionProperties<VoiceCallContract>

/**
 * VoiceCallEntity for internal usage (converted to snake_case)
 * @internal
 */
export type InternalVoiceCallEntity = {
  [K in NonNullable<
    keyof VoiceCallEntity
  > as CamelToSnakeCase<K>]: VoiceCallEntity[K]
}

/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */

interface CallingCallPhoneDevice {
  type: 'phone'
  params: {
    from_number: string
    to_number: string
    timeout: number
    max_duration: number
  }
}

interface CallingCallSIPDevice {
  type: 'sip'
  params: {
    from: string
    from_name?: string
    to: string
    timeout?: number
    max_duration?: number
    headers?: SipHeader[]
    codecs?: SipCodec[]
    webrtc_media?: boolean
  }
}

type CallingCallDevice = CallingCallPhoneDevice | CallingCallSIPDevice
export type CallingCallDirection = 'inbound' | 'outbound'
export type CallingCallState =
  | 'created'
  | 'ringing'
  | 'answered'
  | 'ending'
  | 'ended'

interface CallingCall {
  call_id: string
  call_state: CallingCallState
  context?: string
  tag?: string
  direction: CallingCallDirection
  device: CallingCallDevice
  node_id: string
  segment_id?: string
}

interface CallingCallDial extends CallingCall {
  dial_winner: 'true' | 'false'
}

/**
 * 'calling.call.dial'
 */
export type CallingCallDialDialingEventParams = {
  node_id: string
  tag: string
  dial_state: 'dialing'
}
export type CallingCallDialAnsweredEventParams = {
  node_id: string
  tag: string
  dial_state: 'answered'
  call: CallingCallDial
}
export type CallingCallDialFailedEventParams = {
  node_id: string
  tag: string
  dial_state: 'failed'
  reason: string
  source: CallingCallDirection
}
export type CallingCallDialEventParams =
  | CallingCallDialDialingEventParams
  | CallingCallDialAnsweredEventParams
  | CallingCallDialFailedEventParams

export interface CallingCallDialEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallDial>
  params: CallingCallDialEventParams
}

/**
 * 'calling.call.state'
 */
export interface CallingCallStateEventParams extends CallingCall {
  peer?: {
    call_id: string
    node_id: string
  }
}

export interface CallingCallStateEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallState>
  params: CallingCallStateEventParams
}

/**
 * 'calling.call.receive'
 */
export interface CallingCallReceiveEventParams extends CallingCall {}

export interface CallingCallReceiveEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallReceive>
  params: CallingCallReceiveEventParams
}

/**
 * 'calling.call.play'
 */
export type CallingCallPlayState = 'playing' | 'paused' | 'error' | 'finished'
export interface CallingCallPlayEventParams {
  node_id: string
  call_id: string
  control_id: string
  state: CallingCallPlayState
}

export interface CallingCallPlayEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPlay>
  params: CallingCallPlayEventParams
}

/**
 * 'calling.call.record'
 */
export type CallingCallRecordState = 'recording' | 'no_input' | 'finished'
export interface CallingCallRecordEventParams {
  node_id: string
  call_id: string
  control_id: string
  state: CallingCallRecordState
  url?: string
  duration?: number
  size?: number
  record: any // FIXME:
}

export interface CallingCallRecordEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallRecord>
  params: CallingCallRecordEventParams
}

/**
 * 'calling.call.collect'
 */
interface CallingCallCollectResultError {
  type: 'error'
}
interface CallingCallCollectResultNoInput {
  type: 'no_input'
}
interface CallingCallCollectResultNoMatch {
  type: 'no_match'
}
interface CallingCallCollectResultDigit {
  type: 'digit'
  params: {
    digits: string
    terminator: string
  }
}
interface CallingCallCollectResultSpeech {
  type: 'speech'
  params: {
    text: string
    confidence: number
  }
}
export type CallingCallCollectResult =
  | CallingCallCollectResultError
  | CallingCallCollectResultNoInput
  | CallingCallCollectResultNoMatch
  | CallingCallCollectResultDigit
  | CallingCallCollectResultSpeech

export interface CallingCallCollectEventParams {
  node_id: string
  call_id: string
  control_id: string
  result: CallingCallCollectResult
  final?: boolean
}

export interface CallingCallCollectEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallCollect>
  params: CallingCallCollectEventParams
}

/**
 * 'calling.call.tap'
 */
export type CallingCallTapState = 'tapping' | 'finished'

interface CallingCallTapDeviceRTP {
  type: 'rtp'
  params: {
    addr: string
    port: number
    codec?: TapCodec
    ptime?: number
  }
}

interface CallingCallTapDeviceWS {
  type: 'ws'
  params: {
    uri: string
    codec?: TapCodec
    rate?: number
  }
}

interface CallingCallTapAudio {
  type: 'audio'
  params: {
    direction?: TapDirection
  }
}

export interface CallingCallTapEventParams {
  node_id: string
  call_id: string
  control_id: string
  state: CallingCallTapState
  tap: CallingCallTapAudio
  device: CallingCallTapDeviceRTP | CallingCallTapDeviceWS
}

export interface CallingCallTapEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallTap>
  params: CallingCallTapEventParams
}

/**
 * 'calling.call.connect'
 */
export type CallingCallConnectState =
  | 'connecting'
  | 'connected'
  | 'failed'
  | 'disconnected'
export interface CallingCallConnectEventParams {
  node_id: string
  call_id: string
  tag: string
  connect_state: CallingCallConnectState
  failed_reason?: string
  peer: {
    node_id: string
    call_id: string
    tag: string
    device: CallingCallDevice
  }
}

export interface CallingCallConnectEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallConnect>
  params: CallingCallConnectEventParams
}

/**
 * 'calling.call.send_digits
 */

export type CallingCallSendDigitsState = 'finished'
export interface CallingCallSendDigitsEventParams {
  node_id: string
  call_id: string
  control_id: string
  state: CallingCallSendDigitsState
}

export interface CallingCallSendDigitsEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallSendDigits>
  params: CallingCallSendDigitsEventParams
}

/**
 * 'calling.call.detect'
 */
type CallingCallDetectState = 'finished' | 'error'
interface CallingCallDetectFax {
  type: 'fax'
  params: {
    event: 'CED' | 'CNG' | CallingCallDetectState
  }
}
interface CallingCallDetectMachine {
  type: 'machine'
  params: {
    event:
      | 'MACHINE'
      | 'HUMAN'
      | 'UNKNOWN'
      | 'READY'
      | 'NOT_READY'
      | CallingCallDetectState
  }
}
interface CallingCallDetectDigit {
  type: 'digit'
  params: {
    event:
      | '0'
      | '1'
      | '2'
      | '3'
      | '4'
      | '5'
      | '6'
      | '7'
      | '8'
      | '9'
      | '#'
      | '*'
      | CallingCallDetectState
  }
}
export type Detector =
  | CallingCallDetectFax
  | CallingCallDetectMachine
  | CallingCallDetectDigit
type CallingCallDetectType = Detector['type']
export interface CallingCallDetectEventParams {
  node_id: string
  call_id: string
  control_id: string
  detect?: Detector
}

export interface CallingCallDetectEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallDetect>
  params: CallingCallDetectEventParams
}

/**
 * ==========
 * ==========
 * SDK-Side Events
 * ==========
 * ==========
 */

/**
 * 'calling.playback.started'
 */
export interface CallPlaybackStartedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPlaybackStarted>
  params: CallingCallPlayEventParams & { tag: string }
}
/**
 * 'calling.playback.updated'
 */
export interface CallPlaybackUpdatedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPlaybackUpdated>
  params: CallingCallPlayEventParams & { tag: string }
}
/**
 * 'calling.playback.ended'
 */
export interface CallPlaybackEndedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPlaybackEnded>
  params: CallingCallPlayEventParams & { tag: string }
}
/**
 * 'calling.call.received'
 */
export interface CallReceivedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallReceived>
  params: CallingCallReceiveEventParams
}

/**
 * 'calling.recording.started'
 */
export interface CallRecordingStartedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallRecordingStarted>
  params: CallingCallRecordEventParams & { tag: string }
}
/**
 * 'calling.recording.updated'
 */
export interface CallRecordingUpdatedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallRecordingUpdated>
  params: CallingCallRecordEventParams & { tag: string }
}
/**
 * 'calling.recording.ended'
 */
export interface CallRecordingEndedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallRecordingEnded>
  params: CallingCallRecordEventParams & { tag: string }
}
/**
 * 'calling.recording.failed'
 */
export interface CallRecordingFailedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallRecordingFailed>
  params: CallingCallRecordEventParams & { tag: string }
}

/**
 * 'calling.prompt.started'
 */
export interface CallPromptStartedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPromptStarted>
  params: CallingCallCollectEventParams & { tag: string }
}
/**
 * 'calling.prompt.updated'
 */
export interface CallPromptUpdatedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPromptUpdated>
  params: CallingCallCollectEventParams & { tag: string }
}
/**
 * 'calling.prompt.ended'
 */
export interface CallPromptEndedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPromptEnded>
  params: CallingCallCollectEventParams & { tag: string }
}
/**
 * 'calling.prompt.failed'
 */
export interface CallPromptFailedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallPromptFailed>
  params: CallingCallCollectEventParams & { tag: string }
}

/**
 * 'calling.tap.started'
 */
export interface CallTapStartedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallTapStarted>
  params: CallingCallTapEventParams & { tag: string }
}
/**
 * 'calling.tap.ended'
 */
export interface CallTapEndedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallTapEnded>
  params: CallingCallTapEventParams & { tag: string }
}

/**
 * 'calling.connect.connecting'
 */
export interface CallConnectConnectingEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallConnectConnecting>
  params: CallingCallConnectEventParams
}
/**
 * 'calling.connect.connected'
 */
export interface CallConnectConnectedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallConnectConnected>
  params: CallingCallConnectEventParams
}
/**
 * 'calling.connect.disconnected'
 */
export interface CallConnectDisconnectedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallConnectDisconnected>
  params: CallingCallConnectEventParams
}
/**
 * 'calling.connect.failed'
 */
export interface CallConnectFailedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallConnectFailed>
  params: CallingCallConnectEventParams
}

/**
 * 'calling.detect.started'
 */
export interface CallDetectStartedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallDetectStarted>
  params: CallingCallDetectEventParams & { tag: string }
}
/**
 * 'calling.detect.updated'
 */
export interface CallDetectUpdatedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallDetectUpdated>
  params: CallingCallDetectEventParams & { tag: string }
}
/**
 * 'calling.detect.ended'
 */
export interface CallDetectEndedEvent extends SwEvent {
  event_type: ToInternalVoiceEvent<CallDetectEnded>
  params: CallingCallDetectEventParams & { tag: string }
}

// interface VoiceCallStateEvent {
//   call_id: string
//   node_id: string
//   tag: string
// }

// /**
//  * 'voice.call.created'
//  */
// export interface VoiceCallCreatedEventParams extends VoiceCallStateEvent {}

// export interface VoiceCallCreatedEvent extends SwEvent {
//   event_type: ToInternalVoiceEvent<CallCreated>
//   params: VoiceCallCreatedEventParams
// }

// /**
//  * 'voice.call.ended'
//  */
// export interface VoiceCallEndedEventParams extends VoiceCallStateEvent {}

// export interface VoiceCallEndedEvent extends SwEvent {
//   event_type: ToInternalVoiceEvent<CallEnded>
//   params: VoiceCallEndedEventParams
// }

export type VoiceCallEvent =
  // Server Events
  | CallingCallDialEvent
  | CallingCallStateEvent
  | CallingCallReceiveEvent
  | CallingCallPlayEvent
  | CallingCallRecordEvent
  | CallingCallCollectEvent
  | CallingCallTapEvent
  | CallingCallConnectEvent
  | CallingCallSendDigitsEvent
  | CallingCallDetectEvent
  // SDK Events
  | CallReceivedEvent
  | CallPlaybackStartedEvent
  | CallPlaybackUpdatedEvent
  | CallPlaybackEndedEvent
  | CallRecordingStartedEvent
  | CallRecordingUpdatedEvent
  | CallRecordingEndedEvent
  | CallRecordingFailedEvent
  | CallPromptStartedEvent
  | CallPromptUpdatedEvent
  | CallPromptEndedEvent
  | CallPromptFailedEvent
  | CallTapStartedEvent
  | CallTapEndedEvent
  | CallConnectConnectingEvent
  | CallConnectConnectedEvent
  | CallConnectDisconnectedEvent
  | CallConnectFailedEvent
  | CallDetectStartedEvent
  | CallDetectUpdatedEvent
  | CallDetectEndedEvent

export type VoiceCallEventParams =
  // Server Event Params
  | CallingCallDialEventParams
  | CallingCallStateEventParams
  | CallingCallReceiveEventParams
  | CallingCallPlayEventParams
  | CallingCallRecordEventParams
  | CallingCallCollectEventParams
  | CallingCallTapEventParams
  | CallingCallConnectEventParams
  | CallingCallSendDigitsEventParams
  | CallingCallDetectEventParams
  // SDK Event Params
  | CallReceivedEvent['params']
  | CallPlaybackStartedEvent['params']
  | CallPlaybackUpdatedEvent['params']
  | CallPlaybackEndedEvent['params']
  | CallRecordingStartedEvent['params']
  | CallRecordingUpdatedEvent['params']
  | CallRecordingEndedEvent['params']
  | CallRecordingFailedEvent['params']
  | CallPromptStartedEvent['params']
  | CallPromptUpdatedEvent['params']
  | CallPromptEndedEvent['params']
  | CallPromptFailedEvent['params']
  | CallTapStartedEvent['params']
  | CallTapEndedEvent['params']
  | CallConnectConnectingEvent['params']
  | CallConnectConnectedEvent['params']
  | CallConnectDisconnectedEvent['params']
  | CallConnectFailedEvent['params']
  | CallDetectStartedEvent['params']
  | CallDetectUpdatedEvent['params']
  | CallDetectEndedEvent['params']

export type VoiceCallAction = MapToPubSubShape<VoiceCallEvent>

export type VoiceCallJSONRPCMethod =
  | 'calling.dial'
  | 'calling.end'
  | 'calling.answer'
  | 'calling.play'
  | 'calling.play.pause'
  | 'calling.play.resume'
  | 'calling.play.volume'
  | 'calling.play.stop'
  | 'calling.record'
  | 'calling.record.stop'
  | 'calling.play_and_collect'
  | 'calling.play_and_collect.stop'
  | 'calling.play_and_collect.volume'
  | 'calling.tap'
  | 'calling.tap.stop'
  | 'calling.connect'
  | 'calling.disconnect'
  | 'calling.send_digits'
  | 'calling.detect'
  | 'calling.detect.stop'

export type CallingTransformType =
  | 'voiceCallReceived'
  | 'voiceCallPlayback'
  | 'voiceCallRecord'
  | 'voiceCallPrompt'
  | 'voiceCallTap'
  | 'voiceCallConnect'
  | 'voiceCallState'
  | 'voiceCallDetect'
