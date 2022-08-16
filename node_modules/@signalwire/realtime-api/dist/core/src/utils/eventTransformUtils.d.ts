import { EventTransform } from './interfaces';
interface InstanceProxyFactoryParams {
    transform: EventTransform;
    payload: Record<any, unknown>;
}
/**
 * Note: the cached instances within `_instanceByTransformType` will never be
 * cleaned since we're caching by `transform.type` so we will always have one
 * instance per type regardless of the Room/Member/Recording we're working on.
 * This is something we can improve in the future, but not an issue right now.
 * Exported for test purposes
 */
export declare const _instanceByTransformType: Map<string, EventTransform>;
export declare const instanceProxyFactory: ({ transform, payload, }: InstanceProxyFactoryParams) => any;
export {};
//# sourceMappingURL=eventTransformUtils.d.ts.map