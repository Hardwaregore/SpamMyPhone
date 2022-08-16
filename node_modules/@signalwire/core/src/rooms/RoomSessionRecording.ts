import { connect } from '../redux'
import { BaseComponent } from '../BaseComponent'
import { BaseComponentOptions } from '../utils/interfaces'
import { OnlyFunctionProperties } from '../types'
import type {
  VideoRecordingContract,
  VideoRecordingEventNames,
} from '../types/videoRecording'

/**
 * Represents a specific recording of a room session.
 */
export interface RoomSessionRecording extends VideoRecordingContract {}

export type RoomSessionRecordingEventsHandlerMapping = Record<
  VideoRecordingEventNames,
  (recording: RoomSessionRecording) => void
>

export class RoomSessionRecordingAPI
  extends BaseComponent<RoomSessionRecordingEventsHandlerMapping>
  implements OnlyFunctionProperties<RoomSessionRecording>
{
  async pause() {
    await this.execute({
      method: 'video.recording.pause',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        recording_id: this.getStateProperty('id'),
      },
    })
  }

  async resume() {
    await this.execute({
      method: 'video.recording.resume',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        recording_id: this.getStateProperty('id'),
      },
    })
  }

  async stop() {
    await this.execute({
      method: 'video.recording.stop',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        recording_id: this.getStateProperty('id'),
      },
    })
  }
}

export const createRoomSessionRecordingObject = (
  params: BaseComponentOptions<RoomSessionRecordingEventsHandlerMapping>
): RoomSessionRecording => {
  const recording = connect<
    RoomSessionRecordingEventsHandlerMapping,
    RoomSessionRecordingAPI,
    RoomSessionRecording
  >({
    store: params.store,
    Component: RoomSessionRecordingAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return recording
}
