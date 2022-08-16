import { ChatMemberContract } from '..'

/**
 * Represents a member in a chat.
 */
export class ChatMember implements ChatMemberContract {
  constructor(private payload: ChatMemberContract) {}

  /** The id of this member */
  get id(): string {
    return this.payload.id
  }

  /** The channel of this member */
  get channel(): string {
    return this.payload.channel
  }

  /** The state of this member */
  get state(): any {
    return this.payload.state ?? {}
  }
}
