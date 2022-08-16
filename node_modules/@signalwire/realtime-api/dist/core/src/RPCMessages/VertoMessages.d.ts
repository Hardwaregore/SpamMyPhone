import { VertoMethod } from '../utils/interfaces';
declare type VertoParams = {
    [key: string]: any;
};
export declare const VertoInvite: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoBye: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoAttach: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoModify: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoInfo: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoAnswer: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoPong: (params?: VertoParams) => {
    id: string;
    method: import("../utils/interfaces").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export declare const VertoResult: (id: string, method: VertoMethod) => {
    id: string;
    result: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export {};
//# sourceMappingURL=VertoMessages.d.ts.map