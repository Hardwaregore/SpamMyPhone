import { SwEvent, RoomStarted, RoomUpdated, RoomEnded } from '.';
import { MapToPubSubShape } from '..';
import { CamelToSnakeCase } from './utils';
declare type VideoManagerNamespace = 'video-manager';
declare type ToInternalVideoManagerEvent<T extends string> = `${VideoManagerNamespace}.${T}`;
declare type RoomsSubscribed = 'rooms.subscribed';
declare type RoomAdded = 'room.added';
declare type RoomDeleted = 'room.deleted';
/** @internal */
export declare type VideoManagerRoomEventNames = RoomStarted | RoomAdded | RoomUpdated | RoomEnded | RoomDeleted;
/**
 * List of internal events
 * @internal
 */
export declare type InternalVideoManagerRoomEventNames = ToInternalVideoManagerEvent<RoomsSubscribed> | ToInternalVideoManagerEvent<VideoManagerRoomEventNames>;
/** @internal */
declare type VideoManagerRoomRole = 'inviteable' | 'configurator' | 'visitor' | 'attendee' | 'moderator' | 'manager';
/** @internal */
export interface VideoManagerRoomEntity {
    id: string;
    name: string;
    cantinaId: string;
    lastSnapshot?: string;
    memberCount: number;
    recording: boolean;
    locked: boolean;
    roomType: 'permanent' | 'adhoc';
    visibility: 'pinned' | 'normal' | 'occupied';
    roomDescription?: string;
    joinButton?: string;
    orderPriority?: number;
    customAlone?: string;
    customCanvas?: string;
    customEmpty?: string;
    customPreview?: string;
    hasSmsFromNumber: boolean;
    autoOpenNav: boolean;
    myRoles: VideoManagerRoomRole[];
}
/**
 * VideoManagerRoomEntity for internal usage (converted to snake_case)
 * @internal
 */
export declare type InternalVideoManagerRoomEntity = {
    [K in keyof VideoManagerRoomEntity as CamelToSnakeCase<K>]: VideoManagerRoomEntity[K];
};
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
    rooms: InternalVideoManagerRoomEntity[];
}
export interface VideoManagerRoomsSubscribedEvent extends SwEvent {
    event_type: ToInternalVideoManagerEvent<RoomsSubscribed>;
    params: VideoManagerRoomsSubscribedEventParams;
}
/**
 * 'video-manager.room.started'
 * 'video-manager.room.added'
 * 'video-manager.room.updated'
 * 'video-manager.room.ended'
 * 'video-manager.room.deleted'
 */
export interface VideoManagerRoomEventParams {
    room: InternalVideoManagerRoomEntity;
}
export interface VideoManagerRoomEvent extends SwEvent {
    event_type: ToInternalVideoManagerEvent<VideoManagerRoomEventNames>;
    params: VideoManagerRoomEventParams;
}
export declare type VideoManagerEvent = VideoManagerRoomsSubscribedEvent | VideoManagerRoomEvent;
export declare type VideoManagerEventParams = VideoManagerRoomsSubscribedEventParams | VideoManagerRoomEventParams;
export declare type VideoManagerAction = MapToPubSubShape<VideoManagerEvent>;
export {};
//# sourceMappingURL=cantina.d.ts.map