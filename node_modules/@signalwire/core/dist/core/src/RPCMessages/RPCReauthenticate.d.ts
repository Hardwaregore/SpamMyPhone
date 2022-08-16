export declare type RPCReauthenticateParams = {
    project: string;
    jwt_token: string;
};
export declare const RPCReauthenticate: (authentication: RPCReauthenticateParams) => {
    id: string;
    method: import("..").JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
//# sourceMappingURL=RPCReauthenticate.d.ts.map