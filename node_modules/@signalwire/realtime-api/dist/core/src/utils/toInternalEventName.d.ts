import { EventEmitter } from './EventEmitter';
declare type ToInternalEventNameParams<EventTypes extends EventEmitter.ValidEventTypes> = {
    event: EventEmitter.EventNames<EventTypes>;
    namespace?: string;
};
export declare const toInternalEventName: <EventTypes extends EventEmitter.ValidEventTypes>({ event, namespace, }: ToInternalEventNameParams<EventTypes>) => EventEmitter.EventNames<EventTypes>;
export {};
//# sourceMappingURL=toInternalEventName.d.ts.map