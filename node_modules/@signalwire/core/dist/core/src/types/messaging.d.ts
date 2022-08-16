import type { OnlyStateProperties, OnlyFunctionProperties, SwEvent } from '..';
import type { MapToPubSubShape } from '../redux/interfaces';
import { PRODUCT_PREFIX_MESSAGING } from '../utils/constants';
/**
 * The state a message can be in.
 *
 *  - `queued`: The message has been queued in Relay.
 *  - `initiated`: Relay has initiated the process of sending the message.
 *  - `sent`: Relay has sent the message.
 *  - `delivered`: The message has been successfully delivered. Due to the nature of SMS and MMS, receiving a `delivered` event is not guaranteed, even if the message is delivered successfully.
 *  - `undelivered`: The message has not been delivered. Due to the nature of SMS and MMS, receiving a `undelivered` event is not guaranteed, even if the message fails to be delivered.
 *  - `failed`: The request has failed.
 */
export declare type MessagingMessageState = 'queued' | 'initiated' | 'sent' | 'delivered' | 'undelivered' | 'failed';
export declare type MessagingNamespace = typeof PRODUCT_PREFIX_MESSAGING;
export declare type MessageReceivedEventName = 'message.received';
export declare type MessageUpdatedEventName = 'message.updated';
export declare type MessagingState = 'messaging.state';
export declare type MessagingReceive = 'messaging.receive';
export declare type MessagingEventNames = MessagingState | MessagingReceive;
export interface MessagingContract {
}
export declare type MessagingEntity = OnlyStateProperties<MessagingContract>;
export declare type MessagingMethods = Omit<OnlyFunctionProperties<MessagingContract>, 'subscribe' | 'unsubscribe' | 'updateToken'>;
/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */
/**
 * 'messaging.state'
 */
export interface MessagingStateEventParams {
    message_id: string;
    context: string;
    direction: 'inbound' | 'outbound';
    tag?: string;
    tags: string[];
    from_number: string;
    to_number: string;
    body: string;
    media?: string[];
    segments: number;
    message_state: MessagingMessageState;
}
export interface MessagingStateEvent extends SwEvent {
    event_type: MessagingState;
    context: string;
    space_id: string;
    project_id: string;
    params: MessagingStateEventParams;
}
/**
 * 'messaging.receive'
 */
export interface MessagingReceiveEventParams {
    message_id: string;
    context: string;
    direction: 'inbound' | 'outbound';
    tags: string[];
    from_number: string;
    to_number: string;
    body: string;
    media?: string[];
    segments: number;
    message_state: 'received';
}
export interface MessagingReceiveEvent extends SwEvent {
    event_type: MessagingReceive;
    context: string;
    space_id: string;
    project_id: string;
    params: MessagingReceiveEventParams;
}
/**
 * Events from the SDK (just renamed for the end-users)
 */
export interface MessageUpdatedEvent extends Omit<MessagingStateEvent, 'event_type'> {
    event_type: 'message.updated';
}
export interface MessageReceivedEvent extends Omit<MessagingReceiveEvent, 'event_type'> {
    event_type: 'message.received';
}
export declare type MessagingEvent = MessagingStateEvent | MessageUpdatedEvent | MessagingReceiveEvent | MessageReceivedEvent;
export declare type MessagingEventParams = MessagingStateEventParams | MessagingReceiveEventParams;
export declare type MessagingAction = MapToPubSubShape<MessagingEvent>;
export declare type MessagingJSONRPCMethod = 'messaging.send';
export declare type MessagingTransformType = 'messagingMessage';
//# sourceMappingURL=messaging.d.ts.map