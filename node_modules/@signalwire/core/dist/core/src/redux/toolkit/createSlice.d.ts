import type { Reducer } from 'redux';
import { ActionCreatorWithoutPayload, PayloadAction, PrepareAction, _ActionCreatorWithPreparedPayload } from '.';
import { DeepReadonly } from '../../types';
import { PayloadActionCreator } from './createAction';
import { CaseReducer, CaseReducers } from './createReducer';
import { ActionReducerMapBuilder } from './mapBuilders';
import { NoInfer } from './tsHelpers';
/**
 * An action creator attached to a slice.
 *
 * @deprecated please use PayloadActionCreator directly
 *
 * @public
 */
export declare type SliceActionCreator<P> = PayloadActionCreator<P>;
/**
 * The return value of `createSlice`
 *
 * @public
 */
export interface Slice<State = any, CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
    /**
     * The slice name.
     */
    name: Name;
    /**
     * The slice's reducer.
     */
    reducer: Reducer<DeepReadonly<State>>;
    /**
     * Action creators for the types of actions that are handled by the slice
     * reducer.
     */
    actions: CaseReducerActions<CaseReducers>;
    /**
     * The individual case reducer functions that were passed in the `reducers` parameter.
     * This enables reuse and testing if they were defined inline when calling `createSlice`.
     */
    caseReducers: SliceDefinedCaseReducers<CaseReducers>;
    /**
     * Provides access to the initial state value given to the slice.
     * If a lazy state initializer was provided, it will be called and a fresh value returned.
     */
    getInitialState: () => DeepReadonly<State>;
}
/**
 * Options for `createSlice()`.
 *
 * @public
 */
export interface CreateSliceOptions<State = any, CR extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
    name: Name;
    initialState: State | (() => State);
    reducers: ValidateSliceCaseReducers<State, CR>;
    extraReducers?: CaseReducers<NoInfer<State>, any> | ((builder: ActionReducerMapBuilder<NoInfer<State>>) => void);
}
/**
 * A CaseReducer with a `prepare` method.
 *
 * @public
 */
export declare type CaseReducerWithPrepare<State, Action extends PayloadAction> = {
    reducer: CaseReducer<State, Action>;
    prepare: PrepareAction<Action['payload']>;
};
/**
 * The type describing a slice's `reducers` option.
 *
 * @public
 */
export declare type SliceCaseReducers<State> = {
    [K: string]: CaseReducer<DeepReadonly<State>, PayloadAction<any>> | CaseReducerWithPrepare<DeepReadonly<State>, PayloadAction<any, string, any, any>>;
};
/**
 * Derives the slice's `actions` property from the `reducers` options
 *
 * @public
 */
export declare type CaseReducerActions<CaseReducers extends SliceCaseReducers<any>> = {
    [Type in keyof CaseReducers]: CaseReducers[Type] extends {
        prepare: any;
    } ? ActionCreatorForCaseReducerWithPrepare<CaseReducers[Type]> : ActionCreatorForCaseReducer<CaseReducers[Type]>;
};
/**
 * Get a `PayloadActionCreator` type for a passed `CaseReducerWithPrepare`
 *
 * @internal
 */
declare type ActionCreatorForCaseReducerWithPrepare<CR extends {
    prepare: any;
}> = _ActionCreatorWithPreparedPayload<CR['prepare'], string>;
/**
 * Get a `PayloadActionCreator` type for a passed `CaseReducer`
 *
 * @internal
 */
declare type ActionCreatorForCaseReducer<CR> = CR extends (state: any, action: infer Action) => any ? Action extends {
    payload: infer P;
} ? PayloadActionCreator<P> : ActionCreatorWithoutPayload : ActionCreatorWithoutPayload;
/**
 * Extracts the CaseReducers out of a `reducers` object, even if they are
 * tested into a `CaseReducerWithPrepare`.
 *
 * @internal
 */
declare type SliceDefinedCaseReducers<CaseReducers extends SliceCaseReducers<any>> = {
    [Type in keyof CaseReducers]: CaseReducers[Type] extends {
        reducer: infer Reducer;
    } ? Reducer : CaseReducers[Type];
};
/**
 * Used on a SliceCaseReducers object.
 * Ensures that if a CaseReducer is a `CaseReducerWithPrepare`, that
 * the `reducer` and the `prepare` function use the same type of `payload`.
 *
 * Might do additional such checks in the future.
 *
 * This type is only ever useful if you want to write your own wrapper around
 * `createSlice`. Please don't use it otherwise!
 *
 * @public
 */
export declare type ValidateSliceCaseReducers<S, ACR extends SliceCaseReducers<S>> = ACR & {
    [T in keyof ACR]: ACR[T] extends {
        reducer(s: S, action?: infer A): any;
    } ? {
        prepare(...a: never[]): Omit<A, 'type'>;
    } : {};
};
/**
 * A function that accepts an initial state, an object full of reducer
 * functions, and a "slice name", and automatically generates
 * action creators and action types that correspond to the
 * reducers and state.
 *
 * The `reducer` argument is passed to `createReducer()`.
 *
 * @public
 */
export declare function createSlice<State, CaseReducers extends SliceCaseReducers<State>, Name extends string = string>(options: CreateSliceOptions<State, CaseReducers, Name>): Slice<State, CaseReducers, Name>;
export {};
//# sourceMappingURL=createSlice.d.ts.map