import { fork, put } from '@redux-saga/core/effects'
import {
  InternalMemberUpdatedEventNames,
  sagaEffects,
  SagaIterator,
  SDKWorker,
  SDKWorkerParams,
  VideoMemberUpdatedEventParams,
  VideoPosition,
  VideoRoomSubscribedEventParams,
} from '..'
import { findNamespaceInPayload } from '../redux/features/shared/namespace'

function* memberPositionLayoutChangedWorker(options: any) {
  const {
    action,
    memberList,
    channels: { pubSubChannel },
  } = options
  const layers = action.payload.layout.layers
  const processedMembers: Record<string, boolean> = {}

  layers.forEach((layer: any) => {
    const memberId = layer.member_id
    if (!memberId) {
      return
    }

    const memberEventParams = memberList.get(memberId)

    if (
      memberEventParams &&
      layer.position !== memberEventParams.member?.current_position
    ) {
      mutateMemberCurrentPosition({
        memberList,
        memberId,
        currentPosition: layer.position,
      })
      processedMembers[memberId] = true
    } else {
      // Values marked as false won't be put to `pubSubChannel`
      processedMembers[memberId] = false
    }
  })

  for (const [memberId, payload] of memberList) {
    if (processedMembers[memberId]) {
      yield put(pubSubChannel, {
        type: 'video.member.updated',
        payload,
      })

      /**
       * `undefined` means that we couldn't find the
       * `memberId` inside the `layout.layers` array, which
       * implies that the user should now be off-canvas
       */
    } else if (processedMembers[memberId] === undefined) {
      const updatedMemberEventParams = mutateMemberCurrentPosition({
        memberList,
        memberId,
        currentPosition: 'off-canvas',
      })

      if (!updatedMemberEventParams) {
        return
      }

      yield put(pubSubChannel, {
        type: 'video.member.updated',
        payload: updatedMemberEventParams,
      })
    }
  }
}

export function* memberUpdatedWorker({
  action,
  channels,
  memberList,
}: Omit<SDKWorkerParams<any>, 'runSaga'> & {
  memberList: MemberEventParamsList
  action: any
}) {
  const memberId = action.payload.member.id
  const updatedMemberEventParams = mutateMemberCurrentPosition({
    memberList,
    memberId,
    currentPosition: memberList.get(memberId)?.member?.current_position,
  })

  if (!updatedMemberEventParams) {
    return
  }

  const {
    member: { updated = [] },
  } = action.payload

  const memberUpdatedPayload = {
    ...updatedMemberEventParams,
    member: {
      ...updatedMemberEventParams.member,
      ...action.payload.member,
    },
  }
  /** member.updated event is the only one updating the memberList payload */
  memberList.set(memberId, memberUpdatedPayload)

  for (const key of updated) {
    const type = `${action.type}.${key}` as InternalMemberUpdatedEventNames
    yield put(channels.pubSubChannel, {
      type,
      payload: memberUpdatedPayload,
    })
  }

  yield put(channels.pubSubChannel, {
    type: action.type,
    payload: memberUpdatedPayload,
  })
}

export const MEMBER_POSITION_COMPOUND_EVENTS = new Map<any, any>([
  [
    'video.member.updated',
    [
      'video.layout.changed',
      // `member.joined` and `member.left` are needed to
      // keep the member list up to date
      'video.member.joined',
      'video.member.left',
    ],
  ],
])

export const memberPositionWorker: SDKWorker<any> =
  function* memberPositionWorker({
    instance,
    channels,
    initialState,
  }): SagaIterator {
    if (!initialState) {
      return
    }

    const { swEventChannel } = channels
    let memberList = initializeMemberList(initialState)

    while (true) {
      const action = yield sagaEffects.take(swEventChannel, (action: any) => {
        const istargetEvent =
          action.type === 'video.member.updated' ||
          action.type === 'video.layout.changed' ||
          action.type === 'video.member.joined' ||
          action.type === 'video.member.left'

        return (
          istargetEvent &&
          findNamespaceInPayload(action) === instance._eventsNamespace
        )
      })

      switch (action.type) {
        case 'video.member.updated': {
          yield fork(memberUpdatedWorker, {
            action,
            channels,
            memberList,
            instance,
          })
          break
        }
        case 'video.member.joined': {
          const member = action.payload.member
          memberList.set(member.id, action.payload)
          break
        }
        case 'video.member.left': {
          const member = action.payload.member
          memberList.delete(member.id)
          break
        }
        case 'video.layout.changed': {
          yield fork(memberPositionLayoutChangedWorker, {
            action,
            channels,
            memberList,
            instance,
          })
          break
        }
      }
    }
  }

type MemberEventParamsList = Map<string, VideoMemberUpdatedEventParams>

const mutateMemberCurrentPosition = ({
  memberList,
  memberId,
  currentPosition,
}: {
  memberList: MemberEventParamsList
  memberId: string
  currentPosition?: VideoPosition
}) => {
  const memberEventParams = memberList.get(memberId)

  if (!memberEventParams) {
    return

    // This is to avoid setting an undefined property
  } else if (!currentPosition) {
    return memberEventParams
  }

  const updatedMemberEventParams: VideoMemberUpdatedEventParams = {
    ...memberEventParams,
    member: {
      ...memberEventParams?.member,
      current_position: currentPosition,
    },
  }
  memberList.set(memberId, updatedMemberEventParams)

  return updatedMemberEventParams
}

const initializeMemberList = (payload: VideoRoomSubscribedEventParams) => {
  const members = payload.room_session.members
  const memberList: MemberEventParamsList = new Map()

  members.forEach((member) => {
    memberList.set(member.id, {
      room_id: payload.room_session.room_id,
      room_session_id: payload.room_session.id,
      // At this point we don't have `member.updated`
      // @ts-expect-error
      member,
    })
  })

  return memberList
}
