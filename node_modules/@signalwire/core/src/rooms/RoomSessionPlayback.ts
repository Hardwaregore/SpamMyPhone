import { connect } from '../redux'
import { BaseComponent } from '../BaseComponent'
import { BaseComponentOptions } from '../utils/interfaces'
import type {
  VideoPlaybackContract,
  VideoPlaybackMethods,
  VideoPlaybackEventNames,
} from '../types/videoPlayback'

/**
 * Instances of this class allow you to control (e.g., pause, resume, stop) the
 * playback inside a room session. You can obtain instances of this class by
 * starting a playback from the desired {@link RoomSession} (see
 * {@link RoomSession.play})
 */
export interface RoomSessionPlayback extends VideoPlaybackContract {}

export type RoomSessionPlaybackEventsHandlerMapping = Record<
  VideoPlaybackEventNames,
  (playback: RoomSessionPlayback) => void
>

export class RoomSessionPlaybackAPI
  extends BaseComponent<RoomSessionPlaybackEventsHandlerMapping>
  implements VideoPlaybackMethods
{
  async pause() {
    await this.execute({
      method: 'video.playback.pause',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
      },
    })
  }

  async resume() {
    await this.execute({
      method: 'video.playback.resume',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
      },
    })
  }

  async stop() {
    await this.execute({
      method: 'video.playback.stop',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
      },
    })
  }

  async setVolume(volume: number) {
    await this.execute({
      method: 'video.playback.set_volume',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
        volume,
      },
    })
  }

  async seek(timecode: number) {
    await this.execute({
      method: 'video.playback.seek_absolute',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
        position: Math.abs(timecode),
      },
    })
  }

  async forward(offset: number = 5000) {
    await this.execute({
      method: 'video.playback.seek_relative',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
        position: Math.abs(offset),
      },
    })
  }

  async rewind(offset: number = 5000) {
    await this.execute({
      method: 'video.playback.seek_relative',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        playback_id: this.getStateProperty('id'),
        position: -Math.abs(offset),
      },
    })
  }
}

export const createRoomSessionPlaybackObject = (
  params: BaseComponentOptions<RoomSessionPlaybackEventsHandlerMapping>
): RoomSessionPlayback => {
  const playback = connect<
    RoomSessionPlaybackEventsHandlerMapping,
    RoomSessionPlaybackAPI,
    RoomSessionPlayback
  >({
    store: params.store,
    Component: RoomSessionPlaybackAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return playback
}
