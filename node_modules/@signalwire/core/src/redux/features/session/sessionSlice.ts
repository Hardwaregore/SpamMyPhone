import type { PayloadAction } from '../../toolkit'
import type { SessionState } from '../../interfaces'
import type {
  RPCConnectResult,
  SessionAuthError,
  SessionAuthStatus,
} from '../../../utils/interfaces'
import type { DeepReadonly } from '../../../types'
import { createDestroyableSlice } from '../../utils/createDestroyableSlice'
import { authErrorAction } from '../../actions'

export const initialSessionState: DeepReadonly<SessionState> = {
  protocol: '',
  iceServers: [],
  authStatus: 'unknown',
  authState: undefined,
  authError: undefined,
  authCount: 0,
}

const sessionSlice = createDestroyableSlice({
  name: 'session',
  initialState: initialSessionState,
  reducers: {
    connected: (state, { payload }: PayloadAction<RPCConnectResult>) => {
      return {
        ...state,
        authStatus: 'authorized',
        authState: payload?.authorization,
        authCount: state.authCount + 1,
        protocol: payload?.protocol ?? '',
        iceServers: payload?.ice_servers ?? [],
      }
    },
    authStatus: (state, { payload }: PayloadAction<SessionAuthStatus>) => {
      return {
        ...state,
        authStatus: payload,
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      authErrorAction.type,
      (state, { payload }: PayloadAction<{ error: SessionAuthError }>) => {
        return {
          ...state,
          authStatus: 'unauthorized',
          authError: payload.error,
        }
      }
    )
  },
})

// prettier-ignore
export const {
  actions: sessionActions,
  reducer: sessionReducer
} = sessionSlice
