import type { PayloadAction } from '../../toolkit';
import type { ExecuteQueueState, ExecuteActionParams } from '../../interfaces';
import type { DeepReadonly } from '../../../types';
export declare const initialExecuteQueueState: DeepReadonly<ExecuteQueueState>;
export declare const executeQueueActions: import("../../toolkit/createSlice").CaseReducerActions<{
    add: (state: {
        readonly queue: readonly {
            readonly requestId?: string | undefined;
            readonly componentId?: string | undefined;
            readonly method: import("../../..").JSONRPCMethod;
            readonly params: {
                readonly [x: string]: any;
            };
        }[];
    }, { payload }: PayloadAction<ExecuteActionParams>) => {
        queue: {
            readonly requestId?: string | undefined;
            readonly componentId?: string | undefined;
            readonly method: import("../../..").JSONRPCMethod;
            readonly params: {
                readonly [x: string]: any;
            };
        }[];
    };
    clean: () => {
        readonly queue: readonly {
            readonly requestId?: string | undefined;
            readonly componentId?: string | undefined;
            readonly method: import("../../..").JSONRPCMethod;
            readonly params: {
                readonly [x: string]: any;
            };
        }[];
    };
}>, executeQueueReducer: import("redux").Reducer<{
    readonly queue: readonly {
        readonly requestId?: string | undefined;
        readonly componentId?: string | undefined;
        readonly method: import("../../..").JSONRPCMethod;
        readonly params: {
            readonly [x: string]: any;
        };
    }[];
}, import("redux").AnyAction>;
//# sourceMappingURL=executeQueueSlice.d.ts.map