import type { SwEvent } from '.';
import type { CamelToSnakeCase, ConvertToInternalTypes, ToInternalVideoEvent, OnlyStateProperties, OnlyFunctionProperties } from './utils';
/**
 * Public event types
 */
export declare type RecordingStarted = 'recording.started';
export declare type RecordingUpdated = 'recording.updated';
export declare type RecordingEnded = 'recording.ended';
/**
 * List of public event names
 */
export declare type VideoRecordingEventNames = RecordingStarted | RecordingUpdated | RecordingEnded;
/**
 * List of internal events
 * @internal
 */
export declare type InternalVideoRecordingEventNames = ToInternalVideoEvent<VideoRecordingEventNames>;
/**
 * Public Contract for a VideoRecording
 */
export interface VideoRecordingContract {
    /** The unique id of this recording */
    id: string;
    /** The id of the room session associated to this recording */
    roomSessionId: string;
    /** Current state */
    state: 'recording' | 'paused' | 'completed';
    /** Duration, if available */
    duration?: number;
    /** Start time, if available */
    startedAt?: Date;
    /** End time, if available */
    endedAt?: Date;
    /** Pauses the recording. */
    pause(): Promise<void>;
    /** Resumes the recording */
    resume(): Promise<void>;
    /** Stops the recording */
    stop(): Promise<void>;
}
/**
 * VideoRecording properties
 */
export declare type VideoRecordingEntity = OnlyStateProperties<VideoRecordingContract>;
/**
 * VideoRecording methods
 */
export declare type VideoRecordingMethods = OnlyFunctionProperties<VideoRecordingContract>;
/**
 * VideoRecordingEntity entity for internal usage (converted
 * to snake_case and mapped to internal types.)
 * @internal
 */
export declare type InternalVideoRecordingEntity = {
    [Property in NonNullable<keyof VideoRecordingEntity> as CamelToSnakeCase<Property>]: ConvertToInternalTypes<Property, 
    /**
     * Default type to be applied to `Property` in case
     * `ConvertToInternalTypes` doesn't have an explicit
     * conversion for the property.
     */
    VideoRecordingEntity[Property]>;
};
/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */
/**
 * 'video.recording.started'
 */
export interface VideoRecordingStartedEventParams {
    room_id: string;
    room_session_id: string;
    recording: InternalVideoRecordingEntity;
}
export interface VideoRecordingStartedEvent extends SwEvent {
    event_type: ToInternalVideoEvent<RecordingStarted>;
    params: VideoRecordingStartedEventParams;
}
/**
 * 'video.recording.updated'
 */
export interface VideoRecordingUpdatedEventParams {
    room_id: string;
    room_session_id: string;
    recording: InternalVideoRecordingEntity;
}
export interface VideoRecordingUpdatedEvent extends SwEvent {
    event_type: ToInternalVideoEvent<RecordingUpdated>;
    params: VideoRecordingUpdatedEventParams;
}
/**
 * 'video.recording.ended'
 */
export interface VideoRecordingEndedEventParams {
    room_id: string;
    room_session_id: string;
    recording: InternalVideoRecordingEntity;
}
export interface VideoRecordingEndedEvent extends SwEvent {
    event_type: ToInternalVideoEvent<RecordingEnded>;
    params: VideoRecordingEndedEventParams;
}
export declare type VideoRecordingEvent = VideoRecordingStartedEvent | VideoRecordingUpdatedEvent | VideoRecordingEndedEvent;
export declare type VideoRecordingEventParams = VideoRecordingStartedEventParams | VideoRecordingUpdatedEventParams | VideoRecordingEndedEventParams;
//# sourceMappingURL=videoRecording.d.ts.map