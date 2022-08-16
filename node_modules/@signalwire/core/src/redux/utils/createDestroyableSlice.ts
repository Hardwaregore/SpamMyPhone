import {
  SliceCaseReducers,
  ValidateSliceCaseReducers,
  createSlice,
} from '../toolkit/createSlice'
import { ActionReducerMapBuilder } from '../toolkit/mapBuilders'
import { destroyAction } from '../actions'

export const createDestroyableSlice = <
  T,
  Reducers extends SliceCaseReducers<T>
>({
  name = '',
  initialState,
  reducers,
  extraReducers,
}: {
  name: string
  initialState: T
  reducers: ValidateSliceCaseReducers<T, Reducers>
  extraReducers?: (builder: ActionReducerMapBuilder<T>) => void
}) => {
  return createSlice({
    name,
    initialState,
    reducers,
    extraReducers: (builder) => {
      builder.addCase(destroyAction.type, () => {
        return initialState
      })

      if (typeof extraReducers === 'function') {
        extraReducers(builder)
      }
    },
  })
}
