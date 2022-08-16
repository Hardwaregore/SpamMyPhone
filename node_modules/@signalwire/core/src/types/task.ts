import type { OnlyStateProperties, OnlyFunctionProperties } from '..'

export type TaskReceivedEventName = 'task.received'

export type TaskEventNames = TaskReceivedEventName

export interface TaskContract {}

export type TaskEntity = OnlyStateProperties<TaskContract>
export type TaskMethods = Omit<
  OnlyFunctionProperties<TaskContract>,
  'subscribe' | 'unsubscribe' | 'updateToken'
>

/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */

/**
 * 'queuing.relay.tasks'
 */
export interface TaskInboundEvent {
  event_type: 'queuing.relay.tasks'
  context: string
  message: Record<string, unknown>
  timestamp: number
  space_id: string
  project_id: string
}

export type TaskEvent = TaskInboundEvent

/**
 * TODO: update MapToPubSubShape in another PR
 * not used MapToPubSubShape because queuing.relay.tasks
 * has a different shape
 */
export type TaskAction = {
  type: TaskReceivedEventName
  payload: TaskInboundEvent
}
