import { SwEvent, RoomStarted, RoomUpdated, RoomEnded } from '.'
import { MapToPubSubShape } from '..'
import { CamelToSnakeCase } from './utils'

type VideoManagerNamespace = 'video-manager'
type ToInternalVideoManagerEvent<T extends string> =
  `${VideoManagerNamespace}.${T}`

type RoomsSubscribed = 'rooms.subscribed'
type RoomAdded = 'room.added'
type RoomDeleted = 'room.deleted'

/** @internal */
export type VideoManagerRoomEventNames =
  | RoomStarted
  | RoomAdded
  | RoomUpdated
  | RoomEnded
  | RoomDeleted

/**
 * List of internal events
 * @internal
 */
export type InternalVideoManagerRoomEventNames =
  | ToInternalVideoManagerEvent<RoomsSubscribed>
  | ToInternalVideoManagerEvent<VideoManagerRoomEventNames>

/** @internal */
type VideoManagerRoomRole =
  | 'inviteable'
  | 'configurator'
  | 'visitor'
  | 'attendee'
  | 'moderator'
  | 'manager'

/** @internal */
export interface VideoManagerRoomEntity {
  id: string
  name: string
  cantinaId: string
  lastSnapshot?: string
  memberCount: number
  recording: boolean
  locked: boolean
  roomType: 'permanent' | 'adhoc'
  visibility: 'pinned' | 'normal' | 'occupied'
  roomDescription?: string
  joinButton?: string
  orderPriority?: number
  customAlone?: string
  customCanvas?: string
  customEmpty?: string
  customPreview?: string
  hasSmsFromNumber: boolean
  autoOpenNav: boolean
  myRoles: VideoManagerRoomRole[]
}

/**
 * VideoManagerRoomEntity for internal usage (converted to snake_case)
 * @internal
 */
export type InternalVideoManagerRoomEntity = {
  [K in keyof VideoManagerRoomEntity as CamelToSnakeCase<K>]: VideoManagerRoomEntity[K]
}

/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */

/**
 * 'video-manager.rooms.subscribed'
 */
export interface VideoManagerRoomsSubscribedEventParams {
  rooms: InternalVideoManagerRoomEntity[]
}

export interface VideoManagerRoomsSubscribedEvent extends SwEvent {
  event_type: ToInternalVideoManagerEvent<RoomsSubscribed>
  params: VideoManagerRoomsSubscribedEventParams
}

/**
 * 'video-manager.room.started'
 * 'video-manager.room.added'
 * 'video-manager.room.updated'
 * 'video-manager.room.ended'
 * 'video-manager.room.deleted'
 */
export interface VideoManagerRoomEventParams {
  room: InternalVideoManagerRoomEntity
}

export interface VideoManagerRoomEvent extends SwEvent {
  event_type: ToInternalVideoManagerEvent<VideoManagerRoomEventNames>
  params: VideoManagerRoomEventParams
}

export type VideoManagerEvent =
  | VideoManagerRoomsSubscribedEvent
  | VideoManagerRoomEvent

export type VideoManagerEventParams =
  | VideoManagerRoomsSubscribedEventParams
  | VideoManagerRoomEventParams

export type VideoManagerAction = MapToPubSubShape<VideoManagerEvent>
