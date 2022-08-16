import { ChatMessageContract, ChatMemberContract } from '..'
import { PubSubMessage } from '../pubSub'

/**
 * Represents a message in a chat.
 */
export class ChatMessage extends PubSubMessage<ChatMessageContract> {
  /** The member which sent this message */
  get member(): ChatMemberContract {
    return this.payload.member
  }
}
