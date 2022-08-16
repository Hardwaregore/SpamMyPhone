import type {
  MessageReceivedEventName,
  MessageUpdatedEventName,
} from '@signalwire/core'
import type { MessageContract } from '../messaging/Message'

export type RealTimeMessagingApiEventsHandlerMapping = Record<
  MessageReceivedEventName | MessageUpdatedEventName,
  (message: MessageContract) => void
>

export type MessagingClientApiEvents = {
  [k in keyof RealTimeMessagingApiEventsHandlerMapping]: RealTimeMessagingApiEventsHandlerMapping[k]
}
