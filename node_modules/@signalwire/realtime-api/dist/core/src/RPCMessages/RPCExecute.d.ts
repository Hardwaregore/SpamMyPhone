import { JSONRPCMethod } from '../utils/interfaces';
declare type RPCExecuteParams = {
    id?: string;
    method: JSONRPCMethod;
    params: Record<string, unknown>;
};
export declare const RPCExecute: ({ method, params }: RPCExecuteParams) => {
    id: string;
    method: JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export {};
//# sourceMappingURL=RPCExecute.d.ts.map