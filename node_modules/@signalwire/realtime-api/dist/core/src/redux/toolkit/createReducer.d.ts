import { Action, AnyAction, Reducer } from 'redux';
import { DeepReadonly } from '../../types';
import { ActionReducerMapBuilder } from './mapBuilders';
import { NoInfer } from './tsHelpers';
export declare type CaseReducer<S = any, A extends Action = AnyAction> = (state: S, action: A) => S | void;
export interface ActionMatcher<A extends AnyAction> {
    (action: AnyAction): action is A;
}
/**
 * Defines a mapping from action types to corresponding action object shapes.
 *
 * @deprecated This should not be used manually - it is only used for internal
 *             inference purposes and should not have any further value.
 *             It might be removed in the future.
 * @public
 */
export declare type Actions<T extends keyof any = string> = Record<T, Action>;
/**
 * A mapping from action types to case reducers for `createReducer()`.
 *
 * @deprecated This should not be used manually - it is only used
 *             for internal inference purposes and using it manually
 *             would lead to type erasure.
 *             It might be removed in the future.
 * @public
 */
export declare type CaseReducers<S, AS extends Actions> = {
    [T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void;
};
export declare type ActionMatcherDescription<S, A extends AnyAction> = {
    matcher: ActionMatcher<A>;
    reducer: CaseReducer<S, NoInfer<A>>;
};
export declare type ActionMatcherDescriptionCollection<S> = Array<ActionMatcherDescription<S, any>>;
export declare type NotFunction<T> = T extends Function ? never : T;
export declare type ReducerWithInitialState<S extends NotFunction<any>> = Reducer<DeepReadonly<S>> & {
    getInitialState: () => DeepReadonly<S>;
};
export declare type ReadonlyActionMatcherDescriptionCollection<S> = ReadonlyArray<ActionMatcherDescription<S, any>>;
export declare function createReducer<S extends NotFunction<any>>(initialState: S | (() => S), builderCallback: (builder: ActionReducerMapBuilder<S>) => void): ReducerWithInitialState<S>;
export declare function createReducer<S extends NotFunction<any>, CR extends CaseReducers<S, any> = CaseReducers<S, any>>(initialState: S | (() => S), actionsMap: CR, actionMatchers?: ActionMatcherDescriptionCollection<S>, defaultCaseReducer?: CaseReducer<S>): ReducerWithInitialState<S>;
//# sourceMappingURL=createReducer.d.ts.map