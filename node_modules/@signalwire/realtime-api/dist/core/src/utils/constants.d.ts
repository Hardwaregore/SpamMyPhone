export declare const STORAGE_PREFIX = "@signalwire:";
export declare const ADD = "add";
export declare const REMOVE = "remove";
export declare const SESSION_ID = "sessId";
export declare const DEFAULT_HOST = "wss://relay.signalwire.com";
export declare enum WebSocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}
/**
 * Used for namespacing events.
 */
export declare const EVENT_NAMESPACE_DIVIDER = ":";
export declare const LOCAL_EVENT_PREFIX = "__local__";
export declare const SYNTHETIC_EVENT_PREFIX = "__synthetic__";
export declare const PRODUCT_PREFIX_VIDEO = "video";
/**
 * video-manager is an [internal] superset of the video apis
 */
export declare const PRODUCT_PREFIX_VIDEO_MANAGER = "video-manager";
export declare const PRODUCT_PREFIX_CHAT: "chat";
/**
 * For now both, `PubSub` and `Chat` share the same
 * namespace but this might change in the future.
 */
export declare const PRODUCT_PREFIX_PUBSUB: "chat";
export declare const PRODUCT_PREFIX_TASK = "tasking";
export declare const PRODUCT_PREFIX_MESSAGING = "messaging";
export declare const PRODUCT_PREFIX_VOICE = "voice";
export declare const PRODUCT_PREFIX_VOICE_CALL = "calling";
export declare const GLOBAL_VIDEO_EVENTS: readonly ["room.started", "room.ended"];
export declare const PRODUCT_PREFIXES: readonly ["video", "video-manager", "chat", "chat", "tasking", "messaging", "voice", "calling"];
/**
 * For internal usage only. These are the fully qualified event names
 * sent by the server
 * @internal
 */
export declare const INTERNAL_GLOBAL_VIDEO_EVENTS: ("video.room.started" | "video.room.ended")[];
//# sourceMappingURL=constants.d.ts.map