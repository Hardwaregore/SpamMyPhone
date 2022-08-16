import { SliceCaseReducers, ValidateSliceCaseReducers } from '../toolkit/createSlice';
import { ActionReducerMapBuilder } from '../toolkit/mapBuilders';
export declare const createDestroyableSlice: <T, Reducers extends SliceCaseReducers<T>>({ name, initialState, reducers, extraReducers, }: {
    name: string;
    initialState: T;
    reducers: ValidateSliceCaseReducers<T, Reducers>;
    extraReducers?: ((builder: ActionReducerMapBuilder<T>) => void) | undefined;
}) => import("../toolkit/createSlice").Slice<T, Reducers, string>;
//# sourceMappingURL=createDestroyableSlice.d.ts.map