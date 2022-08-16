import { Saga } from '@redux-saga/core'
import { call, spawn } from '@redux-saga/core/effects'
import { getLogger } from '../../utils'

export const createRestartableSaga = (saga: Saga) => {
  return function* () {
    spawn(function* () {
      while (true) {
        try {
          getLogger().debug('Run a restartable saga')
          yield call(saga)
          getLogger().debug(
            'One of the restartable saga has ended. Restarting..'
          )
        } catch (error) {
          getLogger().error('Restartable Saga Error', error)
        }
      }
    })
  }
}

const defaultCatchHandler = (error: any) =>
  getLogger().error('Catchable Saga Error', error)

export const createCatchableSaga = <Args = any>(
  saga: Saga,
  errorHandler = defaultCatchHandler
) => {
  return function* (...params: Args[]) {
    try {
      yield call(saga, ...params)
    } catch (error) {
      errorHandler(error)
    }
  }
}
