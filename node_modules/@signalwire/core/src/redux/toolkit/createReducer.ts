import { Action, AnyAction, Reducer } from 'redux'
import { DeepReadonly } from '../../types'
import { ActionReducerMapBuilder, executeReducerBuilderCallback } from './mapBuilders'
import { NoInfer } from './tsHelpers'

export type CaseReducer<S = any, A extends Action = AnyAction> = (
  state: S,
  action: A
) => S | void

export interface ActionMatcher<A extends AnyAction> {
  (action: AnyAction): action is A
}

/**
 * Defines a mapping from action types to corresponding action object shapes.
 *
 * @deprecated This should not be used manually - it is only used for internal
 *             inference purposes and should not have any further value.
 *             It might be removed in the future.
 * @public
 */
export type Actions<T extends keyof any = string> = Record<T, Action>

/**
 * A mapping from action types to case reducers for `createReducer()`.
 *
 * @deprecated This should not be used manually - it is only used
 *             for internal inference purposes and using it manually
 *             would lead to type erasure.
 *             It might be removed in the future.
 * @public
 */
export type CaseReducers<S, AS extends Actions> = {
  [T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void
}

export type ActionMatcherDescription<S, A extends AnyAction> = {
  matcher: ActionMatcher<A>
  reducer: CaseReducer<S, NoInfer<A>>
}

export type ActionMatcherDescriptionCollection<S> = Array<
  ActionMatcherDescription<S, any>
>


export type NotFunction<T> = T extends Function ? never : T

export type ReducerWithInitialState<S extends NotFunction<any>> = Reducer<DeepReadonly<S>> & {
  getInitialState: () => DeepReadonly<S>
}

export type ReadonlyActionMatcherDescriptionCollection<S> = ReadonlyArray<
  ActionMatcherDescription<S, any>
>

function isStateFunction<S>(x: unknown): x is () => S {
  return typeof x === 'function'
}

export function createReducer<S extends NotFunction<any>>(
  initialState: S | (() => S),
  builderCallback: (builder: ActionReducerMapBuilder<S>) => void
): ReducerWithInitialState<S>

export function createReducer<
  S extends NotFunction<any>,
  CR extends CaseReducers<S, any> = CaseReducers<S, any>
>(
  initialState: S | (() => S),
  actionsMap: CR,
  actionMatchers?: ActionMatcherDescriptionCollection<S>,
  defaultCaseReducer?: CaseReducer<S>
): ReducerWithInitialState<S>

export function createReducer<S extends NotFunction<any>>(
  initialState: S | (() => S),
  mapOrBuilderCallback:
    | CaseReducers<S, any>
    | ((builder: ActionReducerMapBuilder<S>) => void),
  actionMatchers: ReadonlyActionMatcherDescriptionCollection<S> = [],
  defaultCaseReducer?: CaseReducer<S>
): ReducerWithInitialState<S> {
  let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] =
    typeof mapOrBuilderCallback === 'function'
      ? executeReducerBuilderCallback(mapOrBuilderCallback)
      : [mapOrBuilderCallback, actionMatchers, defaultCaseReducer]

  // Ensure the initial state gets frozen either way
  let getInitialState: () => S
  if (isStateFunction(initialState)) {
    getInitialState = () => initialState()
  } else {
    getInitialState = () => initialState
  }

  function reducer(state = getInitialState(), action: any): S {
    let caseReducers = [
      actionsMap[action.type],
      ...finalActionMatchers
        .filter(({ matcher }) => matcher(action))
        .map(({ reducer }) => reducer),
    ]
    if (caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer]
    }

    return caseReducers.reduce((previousState, caseReducer): S => {
      if (caseReducer) {
        return caseReducer(previousState, action) as S
      }

      return previousState
    }, state)
  }

  reducer.getInitialState = getInitialState

  return reducer as ReducerWithInitialState<S>
}
