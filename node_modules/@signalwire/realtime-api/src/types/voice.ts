import type {
  CallReceived,
  CallPlaybackStarted,
  CallPlaybackUpdated,
  CallPlaybackEnded,
  CallRecordingStarted,
  CallRecordingUpdated,
  CallRecordingEnded,
  CallRecordingFailed,
  CallPromptStarted,
  CallPromptUpdated,
  CallPromptEnded,
  CallPromptFailed,
  CallTapStarted,
  CallTapEnded,
} from '@signalwire/core'
import type { Call } from '../voice/Call'
import type { CallPlayback } from '../voice/CallPlayback'
import type { CallRecording } from '../voice/CallRecording'
import type { CallPrompt } from '../voice/CallPrompt'
import type { CallTap } from '../voice/CallTap'

export type RealTimeCallApiEventsHandlerMapping = Record<
  CallReceived,
  (call: Call) => void
> &
  Record<
    CallPlaybackStarted | CallPlaybackUpdated | CallPlaybackEnded,
    (playback: CallPlayback) => void
  > &
  Record<
    | CallRecordingStarted
    | CallRecordingUpdated
    | CallRecordingEnded
    | CallRecordingFailed,
    (recording: CallRecording) => void
  > &
  Record<
    CallPromptStarted | CallPromptUpdated | CallPromptEnded | CallPromptFailed,
    (prompt: CallPrompt) => void
  > &
  Record<CallTapStarted | CallTapEnded, (tap: CallTap) => void>

export type RealTimeCallApiEvents = {
  [k in keyof RealTimeCallApiEventsHandlerMapping]: RealTimeCallApiEventsHandlerMapping[k]
}
