import { BaseComponent } from '../BaseComponent';
import { BaseComponentOptions } from '../utils/interfaces';
import { OnlyFunctionProperties } from '../types';
import type { VideoRecordingContract, VideoRecordingEventNames } from '../types/videoRecording';
/**
 * Represents a specific recording of a room session.
 */
export interface RoomSessionRecording extends VideoRecordingContract {
}
export declare type RoomSessionRecordingEventsHandlerMapping = Record<VideoRecordingEventNames, (recording: RoomSessionRecording) => void>;
export declare class RoomSessionRecordingAPI extends BaseComponent<RoomSessionRecordingEventsHandlerMapping> implements OnlyFunctionProperties<RoomSessionRecording> {
    pause(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
}
export declare const createRoomSessionRecordingObject: (params: BaseComponentOptions<RoomSessionRecordingEventsHandlerMapping>) => RoomSessionRecording;
//# sourceMappingURL=RoomSessionRecording.d.ts.map