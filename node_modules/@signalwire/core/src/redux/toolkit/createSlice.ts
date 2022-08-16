import type { Reducer } from 'redux'
import {
  ActionCreatorWithoutPayload,
  createAction,
  PayloadAction,
  PrepareAction,
  _ActionCreatorWithPreparedPayload,
} from '.'
import { DeepReadonly } from '../../types'
import { PayloadActionCreator } from './createAction'
import {
  CaseReducer,
  CaseReducers,
  createReducer,
  ReducerWithInitialState,
} from './createReducer'
import {
  ActionReducerMapBuilder,
  executeReducerBuilderCallback,
} from './mapBuilders'
import { NoInfer } from './tsHelpers'

/**
 * An action creator attached to a slice.
 *
 * @deprecated please use PayloadActionCreator directly
 *
 * @public
 */
export type SliceActionCreator<P> = PayloadActionCreator<P>

/**
 * The return value of `createSlice`
 *
 * @public
 */
export interface Slice<
  State = any,
  CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>,
  Name extends string = string
> {
  /**
   * The slice name.
   */
  name: Name

  /**
   * The slice's reducer.
   */
  reducer: Reducer<DeepReadonly<State>>

  /**
   * Action creators for the types of actions that are handled by the slice
   * reducer.
   */
  actions: CaseReducerActions<CaseReducers>

  /**
   * The individual case reducer functions that were passed in the `reducers` parameter.
   * This enables reuse and testing if they were defined inline when calling `createSlice`.
   */
  caseReducers: SliceDefinedCaseReducers<CaseReducers>

  /**
   * Provides access to the initial state value given to the slice.
   * If a lazy state initializer was provided, it will be called and a fresh value returned.
   */
  getInitialState: () => DeepReadonly<State>
}

/**
 * Options for `createSlice()`.
 *
 * @public
 */
export interface CreateSliceOptions<
  State = any,
  CR extends SliceCaseReducers<State> = SliceCaseReducers<State>,
  Name extends string = string
> {
  name: Name
  initialState: State | (() => State)
  reducers: ValidateSliceCaseReducers<State, CR>
  extraReducers?:
    | CaseReducers<NoInfer<State>, any>
    | ((builder: ActionReducerMapBuilder<NoInfer<State>>) => void)
}

/**
 * A CaseReducer with a `prepare` method.
 *
 * @public
 */
export type CaseReducerWithPrepare<State, Action extends PayloadAction> = {
  reducer: CaseReducer<State, Action>
  prepare: PrepareAction<Action['payload']>
}

/**
 * The type describing a slice's `reducers` option.
 *
 * @public
 */
export type SliceCaseReducers<State> = {
  [K: string]:
    | CaseReducer<DeepReadonly<State>, PayloadAction<any>>
    | CaseReducerWithPrepare<DeepReadonly<State>, PayloadAction<any, string, any, any>>
}

/**
 * Derives the slice's `actions` property from the `reducers` options
 *
 * @public
 */
export type CaseReducerActions<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends { prepare: any }
    ? ActionCreatorForCaseReducerWithPrepare<CaseReducers[Type]>
    : ActionCreatorForCaseReducer<CaseReducers[Type]>
}

/**
 * Get a `PayloadActionCreator` type for a passed `CaseReducerWithPrepare`
 *
 * @internal
 */
type ActionCreatorForCaseReducerWithPrepare<CR extends { prepare: any }> =
  _ActionCreatorWithPreparedPayload<CR['prepare'], string>

/**
 * Get a `PayloadActionCreator` type for a passed `CaseReducer`
 *
 * @internal
 */
type ActionCreatorForCaseReducer<CR> = CR extends (
  state: any,
  action: infer Action
) => any
  ? Action extends { payload: infer P }
    ? PayloadActionCreator<P>
    : ActionCreatorWithoutPayload
  : ActionCreatorWithoutPayload

/**
 * Extracts the CaseReducers out of a `reducers` object, even if they are
 * tested into a `CaseReducerWithPrepare`.
 *
 * @internal
 */
type SliceDefinedCaseReducers<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends {
    reducer: infer Reducer
  }
    ? Reducer
    : CaseReducers[Type]
}

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
export type ValidateSliceCaseReducers<
  S,
  ACR extends SliceCaseReducers<S>
> = ACR & {
  [T in keyof ACR]: ACR[T] extends {
    reducer(s: S, action?: infer A): any
  }
    ? {
        prepare(...a: never[]): Omit<A, 'type'>
      }
    : {}
}

function getType(slice: string, actionKey: string): string {
  return `${slice}/${actionKey}`
}

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
export function createSlice<
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends string = string
>(
  options: CreateSliceOptions<State, CaseReducers, Name>
): Slice<State, CaseReducers, Name> {
  const { name } = options
  if (!name) {
    throw new Error('`name` is a required option for createSlice')
  }

  // const initialState =
  //   typeof options.initialState == 'function'
  //     ? options.initialState
  //     : createNextState(options.initialState, () => {})
  const initialState = options.initialState

  const reducers = options.reducers || {}

  const reducerNames = Object.keys(reducers)

  const sliceCaseReducersByName: Record<string, CaseReducer> = {}
  const sliceCaseReducersByType: Record<string, CaseReducer> = {}
  const actionCreators: Record<string, Function> = {}

  reducerNames.forEach((reducerName) => {
    const maybeReducerWithPrepare = reducers[reducerName]
    const type = getType(name, reducerName)

    let caseReducer: CaseReducer<DeepReadonly<State>, any>
    let prepareCallback: PrepareAction<any> | undefined

    if ('reducer' in maybeReducerWithPrepare) {
      caseReducer = maybeReducerWithPrepare.reducer
      prepareCallback = maybeReducerWithPrepare.prepare
    } else {
      caseReducer = maybeReducerWithPrepare
    }

    sliceCaseReducersByName[reducerName] = caseReducer
    sliceCaseReducersByType[type] = caseReducer
    actionCreators[reducerName] = prepareCallback
      ? createAction(type, prepareCallback)
      : createAction(type)
  })

  function buildReducer() {
    const [
      extraReducers = {},
      actionMatchers = [],
      defaultCaseReducer = undefined,
    ] =
      typeof options.extraReducers === 'function'
        ? executeReducerBuilderCallback(options.extraReducers)
        : [options.extraReducers]

    const finalCaseReducers = { ...extraReducers, ...sliceCaseReducersByType }
    return createReducer(
      initialState,
      finalCaseReducers as any,
      actionMatchers,
      defaultCaseReducer
    )
  }

  let _reducer: ReducerWithInitialState<State>

  return {
    name,
    reducer(state, action) {
      if (!_reducer) _reducer = buildReducer()

      return _reducer(state, action)
    },
    actions: actionCreators as any,
    caseReducers: sliceCaseReducersByName as any,
    getInitialState() {
      if (!_reducer) _reducer = buildReducer()

      return _reducer.getInitialState()
    },
  }
}
