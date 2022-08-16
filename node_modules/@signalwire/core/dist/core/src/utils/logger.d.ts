import type { SDKLogger, InternalSDKLogger } from '..';
declare const setLogger: (logger: SDKLogger | null) => void;
declare const setDebugOptions: (options: any) => void;
declare const getLogger: () => InternalSDKLogger;
export { setLogger, getLogger, setDebugOptions };
//# sourceMappingURL=logger.d.ts.map