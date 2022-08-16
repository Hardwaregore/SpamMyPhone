import { createDestroyableSlice } from '../../utils/createDestroyableSlice'
import type { PayloadAction } from '../../toolkit'
import type { ExecuteQueueState, ExecuteActionParams } from '../../interfaces'
import type { DeepReadonly } from '../../../types'

export const initialExecuteQueueState: DeepReadonly<ExecuteQueueState> = {
  queue: [],
}

const executeQueueSlice = createDestroyableSlice({
  name: 'executeQueue',
  initialState: initialExecuteQueueState,
  reducers: {
    add: (state, { payload }: PayloadAction<ExecuteActionParams>) => {
      // TODO: Do we have to check for something (like an item in
      // queue with the same `payload.method`?) before adding the
      // payload to the queue?
      return {
        ...state,
        queue: state.queue.concat(payload)
      }
    },
    clean: () => {
      return initialExecuteQueueState
    },
  },
})

// prettier-ignore
export const {
  actions: executeQueueActions,
  reducer: executeQueueReducer
} = executeQueueSlice
