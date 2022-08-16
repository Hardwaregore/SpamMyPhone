import { SagaIterator } from '@redux-saga/core'
import { delay, fork, put, select } from '@redux-saga/core/effects'
import { componentActions } from '..'
import { getComponentsToCleanup } from './componentSelectors'

export function* componentCleanupSagaWorker(): SagaIterator {
  const toCleanup = yield select(getComponentsToCleanup)

  if (toCleanup.length) {
    yield put(
      componentActions.cleanup({
        ids: toCleanup,
      })
    )
  }
}

export function* componentCleanupSaga(): SagaIterator {
  while (true) {
    yield delay(3600_000) // 1 hour
    yield fork(componentCleanupSagaWorker)
  }
}
