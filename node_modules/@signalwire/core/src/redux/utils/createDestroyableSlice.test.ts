import { createDestroyableSlice } from './createDestroyableSlice'
import { destroyAction } from '../actions'

describe('createDestroyableSlice', () => {
  it('should set the state back to its `initialState` when the `detroyAction` is dispatched', () => {
    const initialState = { status: true, id: '1234-6789-1011' }
    const slice = createDestroyableSlice({
      name: 'destroyable-slice',
      initialState,
      reducers: {},
      extraReducers: () => {},
    })

    expect(
      slice.reducer({ status: false, id: '2345-6789-1122' }, destroyAction())
    ).toStrictEqual(initialState)
  })

  it('should allow to pass extra reducers', () => {
    const initialState = { status: true, id: '1234-6789-1011' }
    const caseReducerState1 = { status: false, id: '2345-6789-1122' }
    const caseReducerState2 = { status: true, id: '2345-6789-1122' }

    const slice = createDestroyableSlice({
      name: 'destroyable-slice',
      initialState,
      reducers: {},
      extraReducers: (builder) => {
        builder.addCase('a-new-event-type-1', () => caseReducerState1)
        builder.addCase('a-new-event-type-2', () => caseReducerState2)
      },
    })

    expect(
      slice.reducer(initialState, { type: 'a-new-event-type-1' })
    ).toStrictEqual(caseReducerState1)
    expect(
      slice.reducer(initialState, { type: 'a-new-event-type-2' })
    ).toStrictEqual(caseReducerState2)
  })
})
