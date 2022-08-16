import EventEmitter from 'eventemitter3';
/**
 * Checks the shape of the emitter at runtime. This is useful for when
 * the user is using the SDK without TS
 */
declare const assertEventEmitter: (emitter: unknown) => emitter is EventEmitter<string | symbol, any>;
declare const getEventEmitter: <T extends EventEmitter.ValidEventTypes>() => EventEmitter<T, any>;
export { assertEventEmitter, EventEmitter, getEventEmitter };
//# sourceMappingURL=EventEmitter.d.ts.map