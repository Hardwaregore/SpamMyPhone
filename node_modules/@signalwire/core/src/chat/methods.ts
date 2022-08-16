import type {
  ChatJSONRPCMethod,
  InternalChatMessageEntity,
  ChatMessageEntity,
  InternalChatMemberEntity,
  ChatMemberEntity,
} from '../types/chat'
import type { PaginationCursor } from '../types/common'
import type { BaseChatConsumer } from './BaseChat'
import type { ExecuteExtendedOptions, BaseRPCResult } from '../utils/interfaces'
import { toExternalJSON } from '../utils'
import { toInternalChatChannels, isValidChannels } from './utils'

type ChatMethodParams = Record<string, unknown>

interface ChatMethodPropertyDescriptor<OutputType, ParamsType>
  extends PropertyDescriptor {
  value: (params: ParamsType) => Promise<OutputType>
}
type ChatMethodDescriptor<
  OutputType = unknown,
  ParamsType = ChatMethodParams
> = ChatMethodPropertyDescriptor<OutputType, ParamsType> &
  ThisType<BaseChatConsumer>

/**
 * Transform for returning `undefined` for `execute`s that were
 * successully resolved. If the `execute` failed for some reason, then
 * the promise will be rejected and this transform will never be
 * executed.
 */
const baseCodeTransform = () => {}

const createChatMethod = <
  InputType,
  OutputType = InputType,
  ParamsType extends ChatMethodParams = ChatMethodParams
>(
  method: ChatJSONRPCMethod,
  options: ExecuteExtendedOptions<InputType, OutputType, ParamsType> = {}
): ChatMethodDescriptor<OutputType> => ({
  value: function (params = {}): Promise<OutputType> {
    return this.execute(
      {
        method,
        params,
      },
      options
    )
  },
})

/**
 * Type the params for each chat method that requires a memberId.
 * Additional params can be passed.
 */
interface ChatMemberMethodParams extends Record<string, unknown> {
  memberId?: string
}

const createChatMemberMethod = <
  InputType,
  OutputType = InputType,
  ParamsType extends ChatMemberMethodParams = ChatMemberMethodParams
>(
  method: ChatJSONRPCMethod,
  options: ExecuteExtendedOptions<InputType, OutputType, ParamsType> = {}
): ChatMethodDescriptor<OutputType> => ({
  value: function ({ memberId, ...rest } = {}) {
    return this.execute(
      {
        method,
        params: {
          member_id: memberId,
          ...rest,
        },
      },
      options
    )
  },
})

/**
 * Chat Methods
 */
export const publish = createChatMethod<BaseRPCResult, void>('chat.publish', {
  transformResolve: baseCodeTransform,
})

interface GetMessagesInput extends BaseRPCResult {
  messages: InternalChatMessageEntity[]
  cursor: PaginationCursor
}
interface GetMessagesOutput {
  messages: ChatMessageEntity[]
  cursor: PaginationCursor
}
export const getMessages = createChatMethod<
  GetMessagesInput,
  GetMessagesOutput
>('chat.messages.get', {
  transformResolve: (payload) => ({
    messages: payload.messages.map((message) => toExternalJSON(message)),
    cursor: payload.cursor,
  }),
})

interface GetMembersInput extends BaseRPCResult {
  members: InternalChatMemberEntity[]
}
interface GetMembersOutput {
  members: ChatMemberEntity[]
}
export const getMembers = createChatMethod<GetMembersInput, GetMembersOutput>(
  'chat.members.get',
  {
    transformResolve: (payload) => ({
      members: payload.members.map((member) => toExternalJSON(member)),
    }),
  }
)

const transformParamChannels = (params: ChatMemberMethodParams) => {
  const channels = isValidChannels(params?.channels)
    ? toInternalChatChannels(params.channels)
    : undefined

  return {
    ...params,
    channels,
  }
}
/**
 * Chat Member Methods
 */
export const setMemberState = createChatMemberMethod<BaseRPCResult, void>(
  'chat.member.set_state',
  {
    transformResolve: baseCodeTransform,
    transformParams: transformParamChannels,
  }
)

interface GetMemberStateInput extends BaseRPCResult {
  channels: any
}
interface GetMemberStateOutput {
  channels: any
}
export const getMemberState = createChatMemberMethod<
  GetMemberStateInput,
  GetMemberStateOutput
>('chat.member.get_state', {
  transformResolve: (payload) => ({ channels: payload.channels }),
  transformParams: transformParamChannels,
})
