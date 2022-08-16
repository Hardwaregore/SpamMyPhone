import util from 'util'
import { expectSaga } from 'redux-saga-test-plan'
import { memberUpdatedWorker } from '.'
import { createPubSubChannel, createSwEventChannel } from '../testUtils'

describe('memberPositionWorker', () => {
  util.inspect.defaultOptions.depth = null
  it('should handle video.member.updated dispatching the sub-events for what is changed for the user and updating the internal cache', () => {
    const memberId = 'ab42641c-e784-42f1-9815-d264105bc24f'
    const action = {
      type: 'video.member.updated',
      payload: {
        room_session_id: '8e03ac25-8622-411a-95fc-f897b34ac9e7',
        room_id: '6e83849b-5cc2-4fc6-80ed-448113c8a426',
        member: {
          requested_position: 'auto',
          updated: ['visible', 'video_muted'],
          room_session_id: '8e03ac25-8622-411a-95fc-f897b34ac9e7',
          id: memberId,
          visible: true,
          room_id: '6e83849b-5cc2-4fc6-80ed-448113c8a426',
          video_muted: false,
        } as any,
      },
    }
    const pubSubChannel = createPubSubChannel()
    const swEventChannel = createSwEventChannel()
    const dispatchedActions: unknown[] = []
    const memberList = new Map([
      [
        memberId,
        {
          room_session_id: '8e03ac25-8622-411a-95fc-f897b34ac9e7',
          room_id: '6e83849b-5cc2-4fc6-80ed-448113c8a426',
          member: {
            requested_position: 'auto',
            room_session_id: '8e03ac25-8622-411a-95fc-f897b34ac9e7',
            id: memberId,
            visible: false,
            room_id: '6e83849b-5cc2-4fc6-80ed-448113c8a426',
            video_muted: true,
          } as any,
        },
      ],
    ])

    return expectSaga(memberUpdatedWorker, {
      action,
      channels: {
        pubSubChannel,
        swEventChannel,
      },
      memberList,
      instance: {},
    })
      .provide([
        {
          put(action, next) {
            dispatchedActions.push(action)
            return next()
          },
        },
      ])
      .put(pubSubChannel, {
        type: 'video.member.updated.visible',
        payload: action.payload,
      })
      .put(pubSubChannel, {
        type: 'video.member.updated.video_muted',
        payload: action.payload,
      })
      .put(pubSubChannel, {
        type: 'video.member.updated',
        payload: action.payload,
      })
      .run()
      .finally(() => {
        expect(dispatchedActions).toHaveLength(3)
        expect(memberList.get(memberId)?.member.visible).toBe(true)
        expect(memberList.get(memberId)?.member.video_muted).toBe(false)
        expect(memberList.get(memberId)?.member.updated).toStrictEqual([
          'visible',
          'video_muted',
        ])
      })
  })
})
