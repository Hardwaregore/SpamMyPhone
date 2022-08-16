import {
  DisconnectableClientContract,
  BaseComponentOptions,
  BaseComponent,
  ClientContextContract,
} from '@signalwire/core'
import { connect } from '@signalwire/core'
import type { TaskClientApiEvents } from '../types'
import { RealtimeClient } from '../client/index'
import { taskWorker } from './workers'

export interface Task
  extends DisconnectableClientContract<Task, TaskClientApiEvents>,
    ClientContextContract {
  /** @internal */
  _session: RealtimeClient
}

/** @internal */
class TaskAPI extends BaseComponent<TaskClientApiEvents> {
  constructor(options: BaseComponentOptions<TaskClientApiEvents>) {
    super(options)

    this.runWorker('taskWorker', {
      worker: taskWorker,
    })
    this._attachListeners('')
  }
}

/** @internal */
export const createTaskObject = (
  params: BaseComponentOptions<TaskClientApiEvents>
): Task => {
  const task = connect<TaskClientApiEvents, TaskAPI, Task>({
    store: params.store,
    Component: TaskAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return task
}

export * from './TaskClient'
export * from './send'
export type { TaskReceivedEventName } from '@signalwire/core'
export type {
  TaskClientApiEvents,
  RealTimeTaskApiEventsHandlerMapping,
} from '../types'
