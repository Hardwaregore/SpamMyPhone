import { SDKState } from '../../interfaces';
export declare const getIceServers: ({ session }: SDKState) => RTCIceServer[];
export declare const getSession: (store: SDKState) => import("../../interfaces").SessionState;
export declare const getAuthStatus: ({ session }: SDKState) => import("../../..").SessionAuthStatus;
export declare const getAuthError: ({ session }: SDKState) => import("../../..").SessionAuthError | undefined;
export declare const getAuthState: ({ session }: SDKState) => import("../../..").Authorization | undefined;
//# sourceMappingURL=sessionSelectors.d.ts.map