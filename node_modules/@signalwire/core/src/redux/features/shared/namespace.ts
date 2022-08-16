import type {
  ChatEvent,
  InternalVideoMemberEvent,
  InternalVideoRoomEvent,
  VideoLayoutEvent,
  VideoMemberEvent,
  VideoPlaybackEvent,
  VideoRecordingEvent,
  VideoRoomEvent,
  VoiceCallEvent,
} from '../../../types'
import { getLogger } from '../../../utils'
import type { MapToPubSubShape, PubSubAction } from '../../interfaces'

const isVideoMemberEvent = (
  action: PubSubAction
): action is MapToPubSubShape<VideoMemberEvent | InternalVideoMemberEvent> => {
  return (
    action.type.startsWith('video.member.') ||
    // TODO: find a better way to do this check.
    action.type.startsWith('video.__synthetic__.member')
  )
}

const isVideoRoomEvent = (
  action: PubSubAction
): action is MapToPubSubShape<VideoRoomEvent | InternalVideoRoomEvent> => {
  return action.type.startsWith('video.room.')
}

const isVideoLayoutEvent = (
  action: PubSubAction
): action is MapToPubSubShape<VideoLayoutEvent> => {
  return action.type.startsWith('video.layout.')
}

const isVideoRecordingEvent = (
  action: PubSubAction
): action is MapToPubSubShape<VideoRecordingEvent> => {
  return action.type.startsWith('video.recording.')
}

const isVideoPlaybackEvent = (
  action: PubSubAction
): action is MapToPubSubShape<VideoPlaybackEvent> => {
  return action.type.startsWith('video.playback.')
}

const isChatEvent = (
  action: PubSubAction
): action is MapToPubSubShape<ChatEvent> => {
  return action.type.startsWith('chat.')
}

const isVoiceCallEvent = (
  action: PubSubAction
): action is MapToPubSubShape<VoiceCallEvent> => {
  return action.type.startsWith('calling.')
}

export const findNamespaceInPayload = (action: PubSubAction): string => {
  if (action.payload === undefined) {
    return ''
  } else if (
    isVideoMemberEvent(action) ||
    isVideoLayoutEvent(action) ||
    isVideoRecordingEvent(action) ||
    isVideoPlaybackEvent(action)
  ) {
    return action.payload.room_session_id
  } else if (isVideoRoomEvent(action)) {
    return action.payload.room_session.id
  } else if (isChatEvent(action)) {
    return ''
  } else if (isVoiceCallEvent(action)) {
    /**
     * Some calling events (ie: `calling.call.receive`) have no "tag"
     * but we inject it within the workers before put the action.
     * See voiceCallPlayWorker as an example.
     */
    // @ts-expect-error
    return action.payload.tag ?? ''
  }

  if ('development' === process.env.NODE_ENV) {
    getLogger().info(
      'Namespace not found for action.type: ',
      (action as any)?.type
    )
  }

  return ''
}
