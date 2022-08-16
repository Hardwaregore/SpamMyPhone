import { JSONRPCMethod } from '../utils/interfaces';
interface MakeRPCRequestParams {
    id?: string;
    method: JSONRPCMethod;
    params: {
        [key: string]: any;
    };
}
export declare const makeRPCRequest: (params: MakeRPCRequestParams) => {
    id: string;
    method: JSONRPCMethod;
    params: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
interface MakeRPCResponseParams {
    id: string;
    result: {
        [key: string]: any;
    };
}
export declare const makeRPCResponse: (params: MakeRPCResponseParams) => {
    id: string;
    result: {
        [key: string]: any;
    };
    jsonrpc: "2.0";
};
export {};
//# sourceMappingURL=helpers.d.ts.map