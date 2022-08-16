import { BaseRoomInterface } from '.'
import type {
  VideoMemberEntity,
  InternalVideoRecordingEntity,
  VideoRecordingEntity,
  InternalVideoPlaybackEntity,
  VideoPlaybackEntity,
  MemberCommandParams,
  VideoPosition,
} from '../types'
import { toLocalEvent, toExternalJSON } from '../utils'
import {
  ExecuteExtendedOptions,
  RoomMethod,
  BaseRPCResult,
} from '../utils/interfaces'

type RoomMethodParams = Record<string, unknown>

interface RoomMethodPropertyDescriptor<OutputType, ParamsType>
  extends PropertyDescriptor {
  value: (params: ParamsType) => Promise<OutputType>
}

type RoomMethodDescriptor<
  OutputType = unknown,
  ParamsType = RoomMethodParams
> = RoomMethodPropertyDescriptor<OutputType, ParamsType> &
  // TODO: Replace string with a tighter type
  ThisType<BaseRoomInterface<string>>

/**
 * Transform for returning `undefined` for `execute`s that were
 * successully resolved. If the `execute` failed for some reason, then
 * the promise will be rejected and this transform will never be
 * executed.
 */
const baseCodeTransform = () => {}

const createRoomMethod = <
  InputType,
  OutputType = InputType,
  ParamsType extends RoomMethodParams = RoomMethodParams
>(
  method: RoomMethod,
  options: ExecuteExtendedOptions<InputType, OutputType, ParamsType> = {}
): RoomMethodDescriptor<OutputType, ParamsType> => ({
  value: function (params = {} as ParamsType): Promise<OutputType> {
    return this.execute(
      {
        method,
        params: {
          room_session_id: this.roomSessionId,
          ...params,
        },
      },
      options
    )
  },
})

/**
 * Type the params for each room member method that uses the provided
 * memberId or fallback to the instance memberId. Additional params
 * can be passed as `value` or `volume`.
 */
interface RoomMemberMethodParams extends Record<string, unknown> {
  memberId?: string
}

const createRoomMemberMethod = <
  InputType,
  OutputType,
  ParamsType extends RoomMemberMethodParams = RoomMemberMethodParams
>(
  method: RoomMethod,
  options: ExecuteExtendedOptions<InputType, OutputType, ParamsType> = {}
): RoomMethodDescriptor<OutputType, ParamsType> => ({
  value: function ({ memberId, ...rest } = {} as ParamsType) {
    return this.execute(
      {
        method,
        params: {
          room_session_id: this.roomSessionId,
          member_id: memberId || this.memberId,
          ...rest,
        },
      },
      options
    )
  },
})

/**
 * Room Methods
 */
export const getLayouts = createRoomMethod<{ layouts: string[] }>(
  'video.list_available_layouts',
  {
    transformResolve: (payload) => ({ layouts: payload.layouts }),
  }
)
export const getMembers = createRoomMethod<{ members: VideoMemberEntity[] }>(
  'video.members.get',
  {
    transformResolve: (payload) => ({ members: payload.members }),
  }
)
export interface SetLayoutParams {
  name: string
  positions?: Record<string, VideoPosition>
}
export const setLayout = createRoomMethod<BaseRPCResult, void>(
  'video.set_layout',
  {
    transformResolve: baseCodeTransform,
  }
)
export interface SetPositionsParams {
  positions: Record<string, VideoPosition>
}
export const setPositions = createRoomMethod<BaseRPCResult, void>(
  'video.set_position',
  {
    transformResolve: baseCodeTransform,
  }
)
export const hideVideoMuted = createRoomMethod<BaseRPCResult, void>(
  'video.hide_video_muted',
  {
    transformResolve: baseCodeTransform,
  }
)
export const showVideoMuted = createRoomMethod<BaseRPCResult, void>(
  'video.show_video_muted',
  {
    transformResolve: baseCodeTransform,
  }
)

export const setHideVideoMuted: RoomMethodDescriptor<void, boolean> = {
  value: function (value) {
    return this.execute(
      {
        method: value ? 'video.hide_video_muted' : 'video.show_video_muted',
        params: {
          room_session_id: this.roomSessionId,
        },
      },
      {
        transformResolve: baseCodeTransform,
      }
    )
  },
}

interface GetRecordingsInput extends BaseRPCResult {
  recordings: InternalVideoRecordingEntity[]
}
export interface GetRecordingsOutput {
  recordings: VideoRecordingEntity[]
}

export const getRecordings = createRoomMethod<
  GetRecordingsInput,
  GetRecordingsOutput
>('video.recording.list', {
  transformResolve: (payload) => ({
    recordings: payload.recordings.map((row) => toExternalJSON(row)),
  }),
})

export const startRecording: RoomMethodDescriptor<void> = {
  value: function () {
    return new Promise(async (resolve) => {
      const handler = (instance: any) => {
        resolve(instance)
      }
      this.on(toLocalEvent('video.recording.start'), handler)

      try {
        const payload = await this.execute({
          method: 'video.recording.start',
          params: {
            room_session_id: this.roomSessionId,
          },
        })
        this.emit(toLocalEvent('video.recording.start'), {
          ...(payload as object),
          room_session_id: this.roomSessionId,
        })
      } catch (error) {
        this.off(toLocalEvent('video.recording.start'), handler)
        throw error
      }
    })
  },
}

interface GetPlaybacksInput extends BaseRPCResult {
  playbacks: InternalVideoPlaybackEntity[]
}
export interface GetPlaybacksOutput {
  playbacks: VideoPlaybackEntity[]
}

export const getPlaybacks = createRoomMethod<
  GetPlaybacksInput,
  GetPlaybacksOutput
>('video.playback.list', {
  transformResolve: (payload) => ({
    playbacks: payload.playbacks.map((row) => toExternalJSON(row)),
  }),
})

export type PlayParams = {
  url: string
  volume?: number
  positions?: Record<string, VideoPosition>
  layout?: string
  currentTimecode?: number
}
export const play: RoomMethodDescriptor<any, PlayParams> = {
  value: function (params) {
    return new Promise(async (resolve) => {
      const handler = (instance: any) => {
        resolve(instance)
      }
      this.on(toLocalEvent('video.playback.start'), handler)

      try {
        const payload = await this.execute({
          method: 'video.playback.start',
          params: {
            room_session_id: this.roomSessionId,
            ...params,
          },
        })
        this.emit(toLocalEvent('video.playback.start'), {
          ...(payload as object),
          room_session_id: this.roomSessionId,
        })
      } catch (error) {
        this.off(toLocalEvent('video.playback.start'), handler)
        throw error
      }
    })
  },
}

export interface SetMetaParams extends Record<string, unknown> {}
export const setMeta = createRoomMethod<BaseRPCResult, void, SetMetaParams>(
  'video.set_meta',
  {
    transformResolve: baseCodeTransform,
    transformParams: (params) => {
      const { room_session_id, ...meta } = params
      return { room_session_id, meta }
    },
  }
)

export type GetLayouts = ReturnType<typeof getLayouts.value>
export type GetMembers = ReturnType<typeof getMembers.value>
export type HideVideoMuted = ReturnType<typeof hideVideoMuted.value>
export type ShowVideoMuted = ReturnType<typeof showVideoMuted.value>
export type SetHideVideoMuted = ReturnType<typeof setHideVideoMuted.value>

export type GetRecordings = ReturnType<typeof getRecordings.value>
export type StartRecording = ReturnType<typeof startRecording.value>

export type GetPlaybacks = ReturnType<typeof getPlaybacks.value>
export type Play = ReturnType<typeof play.value>
export type SetMeta = ReturnType<typeof setMeta.value>
// End Room Methods

/**
 * Room Member Methods
 */
export const audioMuteMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.audio_mute',
  {
    transformResolve: baseCodeTransform,
  }
)
export const audioUnmuteMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.audio_unmute',
  {
    transformResolve: baseCodeTransform,
  }
)
export const videoMuteMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.video_mute',
  {
    transformResolve: baseCodeTransform,
  }
)
export const videoUnmuteMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.video_unmute',
  {
    transformResolve: baseCodeTransform,
  }
)
export const deafMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.deaf',
  {
    transformResolve: baseCodeTransform,
  }
)
export const undeafMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.undeaf',
  {
    transformResolve: baseCodeTransform,
  }
)
// This is used on a RoomSessionMember instance where we have
// `this.roomSessionId` and `this.memberId`
export const setDeaf: RoomMethodDescriptor<void, boolean> = {
  value: function (value) {
    return this.execute(
      {
        method: value ? 'video.member.deaf' : 'video.member.undeaf',
        params: {
          room_session_id: this.roomSessionId,
          member_id: this.memberId,
        },
      },
      {
        transformResolve: baseCodeTransform,
      }
    )
  },
}
export const setInputVolumeMember = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.set_input_volume',
  {
    transformResolve: baseCodeTransform,
  }
)
export const setOutputVolumeMember = createRoomMemberMethod<
  BaseRPCResult,
  void
>('video.member.set_output_volume', {
  transformResolve: baseCodeTransform,
})
export const setInputSensitivityMember = createRoomMemberMethod<
  BaseRPCResult,
  void
>('video.member.set_input_sensitivity', {
  transformResolve: baseCodeTransform,
})
export interface SetMemberPositionParams extends MemberCommandParams {
  position: VideoPosition
}
export const setMemberPosition = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.set_position',
  {
    transformResolve: baseCodeTransform,
  }
)
export const removeMember: RoomMethodDescriptor<
  void,
  Required<RoomMemberMethodParams>
> = {
  value: function ({ memberId, ...rest }) {
    if (!memberId) {
      throw new TypeError('Invalid or missing "memberId" argument')
    }
    return this.execute(
      {
        method: 'video.member.remove',
        params: {
          room_session_id: this.roomSessionId,
          member_id: memberId,
          ...rest,
        },
      },
      {
        transformResolve: baseCodeTransform,
      }
    )
  },
}

export const removeAllMembers: RoomMethodDescriptor<void, void> = {
  value: function () {
    return this.execute(
      {
        method: 'video.member.remove',
        params: {
          room_session_id: this.roomSessionId,
          member_id: 'all',
        },
      },
      {
        transformResolve: baseCodeTransform,
      }
    )
  },
}

export interface SetMemberMetaParams extends MemberCommandParams {
  meta: Record<string, unknown>
}
export const setMemberMeta = createRoomMemberMethod<BaseRPCResult, void>(
  'video.member.set_meta',
  {
    transformResolve: baseCodeTransform,
  }
)

export type AudioMuteMember = ReturnType<typeof audioMuteMember.value>
export type AudioUnmuteMember = ReturnType<typeof audioUnmuteMember.value>
export type VideoMuteMember = ReturnType<typeof videoMuteMember.value>
export type VideoUnmuteMember = ReturnType<typeof videoUnmuteMember.value>
export type DeafMember = ReturnType<typeof deafMember.value>
export type UndeafMember = ReturnType<typeof undeafMember.value>
export type SetDeaf = ReturnType<typeof setDeaf.value>
export type SetLayout = ReturnType<typeof setLayout.value>
export type SetPositions = ReturnType<typeof setPositions.value>
export type SetInputVolumeMember = ReturnType<typeof setInputVolumeMember.value>
export type SetOutputVolumeMember = ReturnType<
  typeof setOutputVolumeMember.value
>
export type SetInputSensitivityMember = ReturnType<
  typeof setInputSensitivityMember.value
>
export type SetMemberPosition = ReturnType<typeof setMemberPosition.value>
export type RemoveMember = ReturnType<typeof removeMember.value>
export type RemoveAllMembers = ReturnType<typeof removeAllMembers.value>
export type SetMemberMeta = ReturnType<typeof setMemberMeta.value>
// End Room Member Methods
