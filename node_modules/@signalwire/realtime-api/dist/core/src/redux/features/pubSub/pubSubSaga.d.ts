import { SagaIterator } from '@redux-saga/core';
import type { EventEmitter } from '../../../utils/EventEmitter';
import type { PubSubChannel } from '../../interfaces';
declare type PubSubSagaParams = {
    pubSubChannel: PubSubChannel;
    emitter: EventEmitter<string>;
};
export declare function pubSubSaga({ pubSubChannel, emitter, }: PubSubSagaParams): SagaIterator<any>;
export {};
//# sourceMappingURL=pubSubSaga.d.ts.map