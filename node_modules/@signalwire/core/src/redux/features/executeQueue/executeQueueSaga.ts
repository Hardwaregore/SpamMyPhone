import { SagaIterator } from '@redux-saga/core'
import { put, take, fork, select } from '@redux-saga/core/effects'
import type { PayloadAction } from '../../toolkit'
import { ExecuteActionParams } from '../../interfaces'
import { getAuthStatus } from '../session/sessionSelectors'
import { SessionAuthStatus } from '../../../utils/interfaces'
import { executeAction } from '../../actions'
import { getExecuteQueue } from './executeQueueSelectors'
import { executeQueueActions } from './executeQueueSlice'

export function* executeQueueWatcher(): SagaIterator {
  function* worker(action: PayloadAction<ExecuteActionParams>): SagaIterator {
    const authStatus: SessionAuthStatus = yield select(getAuthStatus)
    if (authStatus !== 'authorized') {
      yield put(executeQueueActions.add(action.payload))
    }
  }

  while (true) {
    const action = yield take(executeAction.type)
    yield fork(worker, action)
  }
}

export function* flushExecuteQueueWorker(): SagaIterator {
  const { queue } = yield select(getExecuteQueue)
  for (const params of queue) {
    yield put(executeAction(params))
  }
  yield put(executeQueueActions.clean())
}
