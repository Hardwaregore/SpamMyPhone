import { PubSubMessageContract } from '..';
/**
 * Represents a message in a pubSub context.
 */
export declare class PubSubMessage<PayloadType extends PubSubMessageContract = PubSubMessageContract> implements PubSubMessageContract {
    protected payload: PayloadType;
    constructor(payload: PayloadType);
    /** The id of this message */
    get id(): string;
    /** The channel in which this message was sent */
    get channel(): string;
    /** The content of this message */
    get content(): string;
    /** Any metadata associated to this message */
    get meta(): any;
    /** The date at which this message was published */
    get publishedAt(): Date;
}
//# sourceMappingURL=PubSubMessage.d.ts.map