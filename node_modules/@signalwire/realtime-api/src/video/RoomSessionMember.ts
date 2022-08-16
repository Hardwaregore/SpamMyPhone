import {
  connect,
  BaseComponent,
  BaseComponentOptions,
  extendComponent,
  Rooms,
  VideoMemberContract,
  VideoMemberMethods,
  EntityUpdated,
} from '@signalwire/core'

/**
 * Represents a member of a room session. You receive instances of this type by
 * listening to room events, for example on a {@link RoomSession} object.
 *
 * > ℹ️ State of RoomSessionMember objects
 * >
 * > The state of RoomSessionMember objects, for example `member.visible`, is
 * > immutable. When you receive instances of RoomSessionMember from event
 * > listeners, the state of the member always refers to that specific point in
 * > time and remains fixed for the whole lifetime of the object.
 */
export interface RoomSessionMember extends VideoMemberContract {}
export type RoomSessionMemberUpdated = EntityUpdated<RoomSessionMember>

// TODO: Extend from a variant of `BaseComponent` that
// doesn't expose EventEmitter methods
class RoomSessionMemberComponent extends BaseComponent<{}> {
  async remove() {
    await this.execute({
      method: 'video.member.remove',
      params: {
        room_session_id: this.getStateProperty('roomSessionId'),
        member_id: this.getStateProperty('memberId'),
      },
    })
  }
}

const RoomSessionMemberAPI = extendComponent<
  RoomSessionMemberComponent,
  // `remove` is defined by `RoomSessionMemberComponent`
  Omit<VideoMemberMethods, 'remove'>
>(RoomSessionMemberComponent, {
  audioMute: Rooms.audioMuteMember,
  audioUnmute: Rooms.audioUnmuteMember,
  videoMute: Rooms.videoMuteMember,
  videoUnmute: Rooms.videoUnmuteMember,
  setDeaf: Rooms.setDeaf,
  setMicrophoneVolume: Rooms.setInputVolumeMember,
  setInputVolume: Rooms.setInputVolumeMember,
  setSpeakerVolume: Rooms.setOutputVolumeMember,
  setOutputVolume: Rooms.setOutputVolumeMember,
  setInputSensitivity: Rooms.setInputSensitivityMember,
})

export const createRoomSessionMemberObject = (
  params: BaseComponentOptions<{}>
): RoomSessionMember => {
  const member = connect<{}, RoomSessionMemberComponent, RoomSessionMember>({
    store: params.store,
    Component: RoomSessionMemberAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return member
}
