import { EventTransform } from '..';
export declare const serializeableProxy: ({ instance, proxiedObj, payload, transformedPayload, transform, }: {
    instance: any;
    proxiedObj: any;
    payload: any;
    transformedPayload: any;
    transform: any;
}) => any;
interface ProxyFactoryOptions {
    instance: any;
    transform: EventTransform;
    payload: unknown;
    transformedPayload: any;
}
export declare const proxyFactory: ({ instance, transform, payload, transformedPayload, }: ProxyFactoryOptions) => any;
export {};
//# sourceMappingURL=proxyUtils.d.ts.map