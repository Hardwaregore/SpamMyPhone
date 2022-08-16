import { ChatMemberContract } from '..';
/**
 * Represents a member in a chat.
 */
export declare class ChatMember implements ChatMemberContract {
    private payload;
    constructor(payload: ChatMemberContract);
    /** The id of this member */
    get id(): string;
    /** The channel of this member */
    get channel(): string;
    /** The state of this member */
    get state(): any;
}
//# sourceMappingURL=ChatMember.d.ts.map