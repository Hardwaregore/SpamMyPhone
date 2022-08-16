import { ChatMessageContract, ChatMemberContract } from '..';
import { PubSubMessage } from '../pubSub';
/**
 * Represents a message in a chat.
 */
export declare class ChatMessage extends PubSubMessage<ChatMessageContract> {
    /** The member which sent this message */
    get member(): ChatMemberContract;
}
//# sourceMappingURL=ChatMessage.d.ts.map