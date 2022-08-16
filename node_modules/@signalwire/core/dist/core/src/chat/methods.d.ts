import type { ChatMessageEntity, ChatMemberEntity } from '../types/chat';
import type { PaginationCursor } from '../types/common';
import type { BaseChatConsumer } from './BaseChat';
declare type ChatMethodParams = Record<string, unknown>;
interface ChatMethodPropertyDescriptor<OutputType, ParamsType> extends PropertyDescriptor {
    value: (params: ParamsType) => Promise<OutputType>;
}
declare type ChatMethodDescriptor<OutputType = unknown, ParamsType = ChatMethodParams> = ChatMethodPropertyDescriptor<OutputType, ParamsType> & ThisType<BaseChatConsumer>;
/**
 * Chat Methods
 */
export declare const publish: ChatMethodDescriptor<void, ChatMethodParams>;
interface GetMessagesOutput {
    messages: ChatMessageEntity[];
    cursor: PaginationCursor;
}
export declare const getMessages: ChatMethodDescriptor<GetMessagesOutput, ChatMethodParams>;
interface GetMembersOutput {
    members: ChatMemberEntity[];
}
export declare const getMembers: ChatMethodDescriptor<GetMembersOutput, ChatMethodParams>;
/**
 * Chat Member Methods
 */
export declare const setMemberState: ChatMethodDescriptor<void, ChatMethodParams>;
interface GetMemberStateOutput {
    channels: any;
}
export declare const getMemberState: ChatMethodDescriptor<GetMemberStateOutput, ChatMethodParams>;
export {};
//# sourceMappingURL=methods.d.ts.map