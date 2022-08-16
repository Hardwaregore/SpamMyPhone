import {
  BaseComponentOptions,
  connect,
  EventTransform,
  InternalVideoRoomSessionEventNames,
  toExternalJSON,
  ConsumerContract,
  RoomSessionRecording,
  VideoRoomEventParams,
  RoomSessionPlayback,
  toLocalEvent,
} from '@signalwire/core'
import { AutoSubscribeConsumer } from '../AutoSubscribeConsumer'
import type { RealtimeClient } from '../client/Client'

import {
  RealTimeRoomApiEvents,
  RealTimeVideoApiEvents,
  RealTimeVideoApiEventsHandlerMapping,
  RealTimeRoomApiEventsHandlerMapping,
} from '../types/video'
import {
  createRoomSessionObject,
  RoomSession,
  RoomSessionFullState,
  RoomSessionUpdated,
} from './RoomSession'
import type {
  RoomSessionMember,
  RoomSessionMemberUpdated,
} from './RoomSessionMember'

const videoRoomGetTriggerEvent = toLocalEvent<TransformEvent>('video.room.get')

type TransformEvent =
  | Extract<
      InternalVideoRoomSessionEventNames,
      'video.room.started' | 'video.room.ended'
    >
  | 'video.__local__.room.get'

export interface Video extends ConsumerContract<RealTimeVideoApiEvents> {
  /** @internal */
  subscribe(): Promise<void>
  /** @internal */
  _session: RealtimeClient

  getRoomSessions(): Promise<{ roomSessions: RoomSession[] }>
  getRoomSessionById(id: string): Promise<{ roomSession: RoomSession }>
}
export type {
  RealTimeRoomApiEvents,
  RealTimeRoomApiEventsHandlerMapping,
  RealTimeVideoApiEvents,
  RealTimeVideoApiEventsHandlerMapping,
  RoomSession,
  RoomSessionFullState,
  RoomSessionMember,
  RoomSessionMemberUpdated,
  RoomSessionPlayback,
  RoomSessionRecording,
  RoomSessionUpdated,
}

export type {
  ClientEvents,
  EmitterContract,
  EntityUpdated,
  GlobalVideoEvents,
  InternalVideoMemberEntity,
  LayoutChanged,
  MEMBER_UPDATED_EVENTS,
  MemberCommandParams,
  MemberCommandWithValueParams,
  MemberCommandWithVolumeParams,
  MemberJoined,
  MemberLeft,
  MemberListUpdated,
  MemberTalking,
  MemberTalkingEnded,
  MemberTalkingEventNames,
  MemberTalkingStart,
  MemberTalkingStarted,
  MemberTalkingStop,
  MemberUpdated,
  MemberUpdatedEventNames,
  PlaybackEnded,
  PlaybackStarted,
  PlaybackUpdated,
  RecordingEnded,
  RecordingStarted,
  RecordingUpdated,
  RoomEnded,
  RoomStarted,
  RoomSubscribed,
  RoomUpdated,
  SipCodec,
  VideoLayoutEventNames,
  VideoMemberContract,
  VideoMemberEntity,
  VideoMemberEventNames,
  VideoMemberType,
  VideoPlaybackEventNames,
  VideoPosition,
  VideoRecordingEventNames,
} from '@signalwire/core'

/** @internal */
class VideoAPI extends AutoSubscribeConsumer<RealTimeVideoApiEvents> {
  /** @internal */
  protected _eventsPrefix = 'video' as const

  /** @internal */
  protected subscribeParams = {
    get_initial_state: true,
  }

  /** @internal */
  protected getEmitterTransforms() {
    return new Map<TransformEvent | TransformEvent[], EventTransform>([
      [
        [videoRoomGetTriggerEvent, 'video.room.started', 'video.room.ended'],
        {
          // TODO: create a new key or use `roomSession`?
          type: 'roomSession',
          instanceFactory: () => {
            return createRoomSessionObject({
              store: this.store,
              // Emitter is now typed.
              // @ts-expect-error
              emitter: this.options.emitter,
            })
          },
          payloadTransform: (payload: VideoRoomEventParams) => {
            return toExternalJSON({
              ...payload.room_session,
              room_session_id: payload.room_session.id,
            })
          },
          getInstanceEventNamespace: (payload: VideoRoomEventParams) => {
            return payload.room_session.id
          },
          getInstanceEventChannel: (payload: VideoRoomEventParams) => {
            return payload.room_session.event_channel
          },
        },
      ],
    ])
  }

  async getRoomSessions() {
    return new Promise<{ roomSessions: RoomSession[] }>(
      async (resolve, reject) => {
        try {
          const { rooms = [] }: any = await this.execute({
            method: 'video.rooms.get',
            params: {},
          })
          const roomSessions: RoomSession[] = []
          const handler = (instance: RoomSession) => roomSessions.push(instance)

          // @ts-expect-error
          this.on(videoRoomGetTriggerEvent, handler)

          rooms.forEach((room_session: any) => {
            // @ts-expect-error
            this.emit(videoRoomGetTriggerEvent, { room_session })
          })

          // // @ts-expect-error
          // this.off(videoRoomGetTriggerEvent, handler)
          resolve({ roomSessions })
        } catch (error) {
          console.error('Error listing room sessions', error)
          reject(error)
        }
      }
    )
  }

  async getRoomSessionById(id: string) {
    return new Promise<{ roomSession: RoomSession }>(
      async (resolve, reject) => {
        try {
          const { room }: any = await this.execute({
            method: 'video.room.get',
            params: {
              room_session_id: id,
            },
          })

          // @ts-expect-error
          this.once(videoRoomGetTriggerEvent, (instance: RoomSession) => {
            resolve({ roomSession: instance })
          })

          // @ts-expect-error
          this.emit(videoRoomGetTriggerEvent, { room_session: room })
        } catch (error) {
          console.error('Error retrieving the room session', error)
          reject(error)
        }
      }
    )
  }
}

/** @internal */
export const createVideoObject = (
  params: BaseComponentOptions<RealTimeVideoApiEvents>
): Video => {
  const video = connect<RealTimeVideoApiEvents, VideoAPI, Video>({
    store: params.store,
    Component: VideoAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  const proxy = new Proxy<Video>(video, {
    get(target: any, prop: any, receiver: any) {
      if (prop === '_eventsNamespace') {
        /**
         * Events at this level will always be global so
         * there's no need for a namespace.
         */
        return ''
      } else if (prop === 'eventChannel') {
        return 'video.rooms'
      }

      return Reflect.get(target, prop, receiver)
    },
  })

  return proxy
}

export * from './VideoClient'
