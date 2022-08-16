import {
  BaseComponentOptions,
  connect,
  EventTransform,
  extendComponent,
  JSONRPCSubscribeMethod,
  SessionEvents,
  toExternalJSON,
} from '..'
import { BasePubSubConsumer } from '../pubSub'
import type {
  ChatChannelMessageEvent,
  ChatEventNames,
  ChatMemberEventNames,
  ChatMemberJoinedEvent,
  ChatMemberLeftEvent,
  ChatMemberUpdatedEvent,
  ChatMessageEventName,
  ChatMethods,
} from '../types/chat'
import { PRODUCT_PREFIX_CHAT } from '../utils/constants'
import { ChatMember } from './ChatMember'
import { ChatMessage } from './ChatMessage'
import * as chatMethods from './methods'
import * as workers from './workers'

type ChatMemberEvent =
  | ChatMemberJoinedEvent
  | ChatMemberLeftEvent
  | ChatMemberUpdatedEvent
export type BaseChatApiEventsHandlerMapping = Record<
  ChatMessageEventName,
  (message: ChatMessage) => void
> &
  Record<ChatMemberEventNames, (member: ChatMember) => void> &
  Record<Extract<SessionEvents, 'session.expiring'>, () => void>

/**
 * @privateRemarks
 *
 * Each package will have the option to either extend this
 * type or provide their own event mapping.
 */
export type BaseChatApiEvents<T = BaseChatApiEventsHandlerMapping> = {
  [k in keyof T]: T[k]
}

export class BaseChatConsumer extends BasePubSubConsumer<BaseChatApiEvents> {
  protected override _eventsPrefix = PRODUCT_PREFIX_CHAT
  protected override subscribeMethod: JSONRPCSubscribeMethod = `${PRODUCT_PREFIX_CHAT}.subscribe`

  constructor(options: BaseComponentOptions<BaseChatApiEvents>) {
    super(options)

    this.runWorker('chat', { worker: workers.chatWorker })
  }

  /** @internal */
  protected override getEmitterTransforms() {
    return new Map<ChatEventNames | ChatEventNames[], EventTransform>([
      [
        ['message'],
        {
          type: 'chatMessage',
          instanceFactory: () => {
            return new ChatMessage({} as any)
          },
          payloadTransform: (payload: ChatChannelMessageEvent) => {
            const { channel, message } = payload.params
            return toExternalJSON({
              ...message,
              channel,
            })
          },
        },
      ],
      [
        ['member.joined', 'member.left', 'member.updated'],
        {
          type: 'chatMember',
          instanceFactory: (payload: ChatMemberEvent) => {
            const { member } = payload.params
            return new ChatMember(toExternalJSON(member))
          },
          payloadTransform: (payload: ChatMemberEvent) => {
            const { member } = payload.params
            return toExternalJSON(member)
          },
        },
      ],
    ])
  }
}

export const BaseChatAPI = extendComponent<BaseChatConsumer, ChatMethods>(
  BaseChatConsumer,
  {
    publish: chatMethods.publish,
    getMembers: chatMethods.getMembers,
    getMessages: chatMethods.getMessages,
    setMemberState: chatMethods.setMemberState,
    getMemberState: chatMethods.getMemberState,
  }
)

export const createBaseChatObject = <ChatType>(
  params: BaseComponentOptions<ChatEventNames>
) => {
  const chat = connect<BaseChatApiEvents, BaseChatConsumer, ChatType>({
    store: params.store,
    Component: BaseChatAPI,
    componentListeners: {
      errors: 'onError',
      responses: 'onSuccess',
    },
  })(params)

  return chat
}
