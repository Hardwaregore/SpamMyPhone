import type { TaskReceivedEventName } from '@signalwire/core'

export type RealTimeTaskApiEventsHandlerMapping = Record<
  TaskReceivedEventName,
  (params: Record<string, unknown>) => void
>

export type TaskClientApiEvents = {
  [k in keyof RealTimeTaskApiEventsHandlerMapping]: RealTimeTaskApiEventsHandlerMapping[k]
}
