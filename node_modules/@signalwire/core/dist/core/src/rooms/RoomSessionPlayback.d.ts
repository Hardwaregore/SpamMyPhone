import { BaseComponent } from '../BaseComponent';
import { BaseComponentOptions } from '../utils/interfaces';
import type { VideoPlaybackContract, VideoPlaybackMethods, VideoPlaybackEventNames } from '../types/videoPlayback';
/**
 * Instances of this class allow you to control (e.g., pause, resume, stop) the
 * playback inside a room session. You can obtain instances of this class by
 * starting a playback from the desired {@link RoomSession} (see
 * {@link RoomSession.play})
 */
export interface RoomSessionPlayback extends VideoPlaybackContract {
}
export declare type RoomSessionPlaybackEventsHandlerMapping = Record<VideoPlaybackEventNames, (playback: RoomSessionPlayback) => void>;
export declare class RoomSessionPlaybackAPI extends BaseComponent<RoomSessionPlaybackEventsHandlerMapping> implements VideoPlaybackMethods {
    pause(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
    setVolume(volume: number): Promise<void>;
    seek(timecode: number): Promise<void>;
    forward(offset?: number): Promise<void>;
    rewind(offset?: number): Promise<void>;
}
export declare const createRoomSessionPlaybackObject: (params: BaseComponentOptions<RoomSessionPlaybackEventsHandlerMapping>) => RoomSessionPlayback;
//# sourceMappingURL=RoomSessionPlayback.d.ts.map