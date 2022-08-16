import type { SwEvent } from '.'
import type {
  CamelToSnakeCase,
  ToInternalVideoEvent,
  OnlyStateProperties,
  OnlyFunctionProperties,
} from './utils'

/**
 * Public event types
 */
export type PlaybackStarted = 'playback.started'
export type PlaybackUpdated = 'playback.updated'
export type PlaybackEnded = 'playback.ended'

/**
 * List of public event names
 */
export type VideoPlaybackEventNames =
  | PlaybackStarted
  | PlaybackUpdated
  | PlaybackEnded

/**
 * List of internal events
 * @internal
 */
export type InternalVideoPlaybackEventNames =
  ToInternalVideoEvent<VideoPlaybackEventNames>

/**
 * Public Contract for a VideoPlayback
 */
export interface VideoPlaybackContract {
  /** Unique id for this playback */
  id: string

  /** Id of the room session associated to this playback */
  roomSessionId: string

  /** Current state of the playback */
  state: 'playing' | 'paused' | 'completed'

  /** Whether the seek function can be used for this playback. */
  seekable: boolean

  /** Url of the file reproduced by this playback */
  url: string

  /** Audio volume at which the playback file is reproduced */
  volume: number

  /** Start time, if available */
  startedAt: Date

  /** End time, if available */
  endedAt?: Date

  /** Pauses the playback. */
  pause(): Promise<void>

  /** Resumes the playback. */
  resume(): Promise<void>

  /** Stops the playback. */
  stop(): Promise<void>

  /**
   * Sets the audio volume for the playback.
   *
   * @param volume The desired volume. Values range from -50 to 50, with a
   * default of 0.
   */
  setVolume(volume: number): Promise<void>

  seek(timecode: number): Promise<void>

  forward(offset: number): Promise<void>

  rewind(offset: number): Promise<void>
}

/**
 * VideoPlayback properties
 */
export type VideoPlaybackEntity = OnlyStateProperties<VideoPlaybackContract>

/**
 * VideoPlayback methods
 */
export type VideoPlaybackMethods = OnlyFunctionProperties<VideoPlaybackContract>

/**
 * VideoPlaybackEntity entity for internal usage (converted to snake_case)
 * @internal
 */
export type InternalVideoPlaybackEntity = {
  [K in NonNullable<
    keyof VideoPlaybackEntity
  > as CamelToSnakeCase<K>]: VideoPlaybackEntity[K]
}

/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */

/**
 * 'video.playback.started'
 */
export interface VideoPlaybackStartedEventParams {
  room_id: string
  room_session_id: string
  playback: InternalVideoPlaybackEntity
}

export interface VideoPlaybackStartedEvent extends SwEvent {
  event_type: ToInternalVideoEvent<PlaybackStarted>
  params: VideoPlaybackStartedEventParams
}

/**
 * 'video.playback.updated'
 */
export interface VideoPlaybackUpdatedEventParams {
  room_id: string
  room_session_id: string
  playback: InternalVideoPlaybackEntity
}

export interface VideoPlaybackUpdatedEvent extends SwEvent {
  event_type: ToInternalVideoEvent<PlaybackUpdated>
  params: VideoPlaybackUpdatedEventParams
}

/**
 * 'video.playback.ended'
 */
export interface VideoPlaybackEndedEventParams {
  room_id: string
  room_session_id: string
  playback: InternalVideoPlaybackEntity
}

export interface VideoPlaybackEndedEvent extends SwEvent {
  event_type: ToInternalVideoEvent<PlaybackEnded>
  params: VideoPlaybackEndedEventParams
}

export type VideoPlaybackEvent =
  | VideoPlaybackStartedEvent
  | VideoPlaybackUpdatedEvent
  | VideoPlaybackEndedEvent

export type VideoPlaybackEventParams =
  | VideoPlaybackStartedEventParams
  | VideoPlaybackUpdatedEventParams
  | VideoPlaybackEndedEventParams
