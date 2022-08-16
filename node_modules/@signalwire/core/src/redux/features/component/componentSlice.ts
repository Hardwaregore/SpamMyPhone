import { createDestroyableSlice } from '../../utils/createDestroyableSlice'
import type { PayloadAction } from '../../toolkit'
import type { JSONRPCResponse } from '../../../utils/interfaces'
import type { ComponentState, ReduxComponent } from '../../interfaces'
import type { DeepReadonly } from '../../../types'

export const initialComponentState: DeepReadonly<ComponentState> = {
  byId: {},
}

type UpdateComponent = Partial<ReduxComponent> & Pick<ReduxComponent, 'id'>
type CleanupComponentParams = {
  ids: Array<ReduxComponent['id']>
}

type SuccessParams = {
  componentId: string
  requestId: string
  response: JSONRPCResponse
}
type FailureParams = {
  componentId: string
  requestId: string
  error: JSONRPCResponse
  action: any
}

const requestUpdater = <T>({
  state,
  payload,
  componentId,
  key,
  requestId,
}: {
  state: DeepReadonly<ComponentState>
  payload: T
  componentId: string
  key: 'responses' | 'errors'
  requestId: string
}): DeepReadonly<ComponentState> => {
  if (componentId in state.byId) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [componentId]: {
          ...state.byId[componentId],
          [key]: {
            ...state.byId[componentId][key],
            [requestId]: payload,
          },
        },
      },
    }
  } else {
    return {
      ...state,
      byId: {
        ...state.byId,
        [componentId]: {
          id: componentId,
          [key]: {
            [requestId]: payload,
          },
        },
      },
    }
  }
}

const componentSlice = createDestroyableSlice({
  name: 'components',
  initialState: initialComponentState,
  reducers: {
    upsert: (state, { payload }: PayloadAction<UpdateComponent>) => {
      if (payload.id in state.byId) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [payload.id]: {
              ...state.byId[payload.id],
              ...payload,
            },
          },
        }
      } else {
        return {
          ...state,
          byId: {
            ...state.byId,
            [payload.id]: payload,
          },
        }
      }
    },
    executeSuccess: (state, { payload }: PayloadAction<SuccessParams>) => {
      const { componentId, requestId, response } = payload
      return requestUpdater({
        componentId,
        requestId,
        state,
        key: 'responses',
        payload: response,
      })
    },
    executeFailure: (state, { payload }: PayloadAction<FailureParams>) => {
      const { componentId, requestId, error, action } = payload
      return requestUpdater({
        componentId,
        requestId,
        state,
        key: 'errors',
        payload: {
          action,
          jsonrpc: error,
        },
      })
    },
    cleanup: (state, { payload }: PayloadAction<CleanupComponentParams>) => {
      return {
        ...state,
        byId: Object.entries(state.byId).reduce(
          (reducer, [componentId, value]) => {
            if (!payload.ids.includes(componentId)) {
              reducer[componentId] = value
            }

            return reducer
          },
          {} as ComponentState['byId']
        ),
      }
    },
  },
})

// prettier-ignore
export const {
  actions: componentActions,
  reducer: componentReducer
} = componentSlice
