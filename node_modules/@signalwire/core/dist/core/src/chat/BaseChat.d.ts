import { BaseComponentOptions, EventTransform, JSONRPCSubscribeMethod, SessionEvents } from '..';
import { BasePubSubConsumer } from '../pubSub';
import type { ChatEventNames, ChatMemberEventNames, ChatMessageEventName } from '../types/chat';
import { ChatMember } from './ChatMember';
import { ChatMessage } from './ChatMessage';
export declare type BaseChatApiEventsHandlerMapping = Record<ChatMessageEventName, (message: ChatMessage) => void> & Record<ChatMemberEventNames, (member: ChatMember) => void> & Record<Extract<SessionEvents, 'session.expiring'>, () => void>;
/**
 * @privateRemarks
 *
 * Each package will have the option to either extend this
 * type or provide their own event mapping.
 */
export declare type BaseChatApiEvents<T = BaseChatApiEventsHandlerMapping> = {
    [k in keyof T]: T[k];
};
export declare class BaseChatConsumer extends BasePubSubConsumer<BaseChatApiEvents> {
    protected _eventsPrefix: "chat";
    protected subscribeMethod: JSONRPCSubscribeMethod;
    constructor(options: BaseComponentOptions<BaseChatApiEvents>);
    /** @internal */
    protected getEmitterTransforms(): Map<ChatEventNames | ChatEventNames[], EventTransform>;
}
export declare const BaseChatAPI: import("..").ConstructableType<BaseChatConsumer>;
export declare const createBaseChatObject: <ChatType>(params: BaseComponentOptions<ChatEventNames>) => ChatType;
//# sourceMappingURL=BaseChat.d.ts.map