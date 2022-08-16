import { combineReducers } from './toolkit'
import {
  componentReducer,
  sessionReducer,
  executeQueueReducer,
} from './features'

export const rootReducer = combineReducers({
  components: componentReducer,
  session: sessionReducer,
  executeQueue: executeQueueReducer,
})
