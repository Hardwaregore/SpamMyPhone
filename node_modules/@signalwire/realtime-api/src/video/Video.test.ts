import { actions } from '@signalwire/core'
import { configureFullStack } from '../testUtils'
import { RoomSessionConsumer } from './RoomSession'
import { createVideoObject, Video } from './Video'

describe('Video Object', () => {
  let video: Video

  const { store, session, emitter, destroy } = configureFullStack()
  beforeEach(() => {
    // remove all listeners before each run
    emitter.removeAllListeners()

    video = createVideoObject({
      store,
      // @ts-expect-error
      emitter,
    })
    // @ts-expect-error
    video.execute = jest.fn()
  })

  afterAll(() => {
    destroy()
  })

  it('should not invoke execute without event listeners', async () => {
    await video.subscribe()
    // @ts-expect-error
    expect(video.execute).not.toHaveBeenCalled()
  })

  it('should invoke execute with event listeners', async () => {
    video.on('room.started', jest.fn)
    await video.subscribe()
    // @ts-expect-error
    expect(video.execute).toHaveBeenCalledWith({
      method: 'signalwire.subscribe',
      params: {
        get_initial_state: true,
        event_channel: 'video.rooms',
        events: ['video.room.started'],
      },
    })
  })

  describe('video.room.started event', () => {
    const eventChannelOne = 'room.<uuid-one>'
    const firstRoom = JSON.parse(
      `{"jsonrpc":"2.0","id":"uuid1","method":"signalwire.event","params":{"params":{"room":{"recording":false,"room_session_id":"session-one","name":"First Room","hide_video_muted":false,"music_on_hold":false,"room_id":"room_id","event_channel":"${eventChannelOne}"},"room_session_id":"session-one","room_id":"room_id","room_session":{"recording":false,"name":"First Room","hide_video_muted":false,"id":"session-one","music_on_hold":false,"room_id":"room_id","event_channel":"${eventChannelOne}"}},"timestamp":1631692502.1308,"event_type":"video.room.started","event_channel":"video.rooms.4b7ae78a-d02e-4889-a63b-08b156d5916e"}}`
    )
    const eventChannelTwo = 'room.<uuid-two>'
    const secondRoom = JSON.parse(
      `{"jsonrpc":"2.0","id":"uuid1","method":"signalwire.event","params":{"params":{"room":{"recording":false,"room_session_id":"session-two","name":"Second Room","hide_video_muted":false,"music_on_hold":false,"room_id":"room_id","event_channel":"${eventChannelTwo}"},"room_session_id":"session-two","room_id":"room_id","room_session":{"recording":false,"name":"Second Room","hide_video_muted":false,"id":"session-two","music_on_hold":false,"room_id":"room_id","event_channel":"${eventChannelTwo}"}},"timestamp":1631692502.1308,"event_type":"video.room.started","event_channel":"video.rooms.4b7ae78a-d02e-4889-a63b-08b156d5916e"}}`
    )

    it('should pass a Room obj to the handler', (done) => {
      video.on('room.started', (room) => {
        expect(room.id).toBe('session-one')
        expect(room.name).toBe('First Room')
        expect(room.videoMute).toBeDefined()
        expect(room.videoUnmute).toBeDefined()
        expect(room.getMembers).toBeDefined()
        expect(room.subscribe).toBeDefined()
        done()
      })

      video.subscribe().then(() => {
        session.dispatch(actions.socketMessageAction(firstRoom))
      })
    })

    it('should destroy the cached obj when an event has no longer handlers attached', async () => {
      const destroyer = jest.fn()
      const h = (room: any) => {
        room._destroyer = destroyer
      }
      video.on('room.started', h)

      await video.subscribe()
      session.dispatch(actions.socketMessageAction(firstRoom))

      video.off('room.started', h)
      expect(destroyer).toHaveBeenCalled()
    })

    it('should *not* destroy the cached obj when there are existing listeners attached', async () => {
      const destroyer = jest.fn()
      const h = (room: any) => {
        room._destroyer = destroyer
      }
      video.on('room.started', h)
      video.on('room.started', () => {})

      await video.subscribe()
      session.dispatch(actions.socketMessageAction(firstRoom))

      video.off('room.started', h)
      expect(destroyer).not.toHaveBeenCalled()
    })

    it('should destroy the cached obj when .off is called with no handler', async () => {
      const destroyer = jest.fn()
      const h = (room: any) => {
        room._destroyer = destroyer
      }
      video.on('room.started', h)
      video.on('room.started', () => {})
      video.on('room.started', () => {})

      await video.subscribe()
      session.dispatch(actions.socketMessageAction(firstRoom))

      video.off('room.started')
      expect(destroyer).toHaveBeenCalled()
    })

    it('each room object should use its own payload from the Proxy', async () => {
      const mockExecute = jest.fn()
      const mockNameCheck = jest.fn()
      const promise = new Promise((resolve) => {
        video.on('room.started', (room) => {
          expect(room.videoMute).toBeDefined()
          expect(room.videoUnmute).toBeDefined()
          expect(room.getMembers).toBeDefined()
          expect(room.subscribe).toBeDefined()

          room.on('member.joined', jest.fn)
          // @ts-expect-error
          room.execute = mockExecute
          room.subscribe()
          mockNameCheck(room.name)

          if (room.id === 'session-two') {
            resolve(undefined)
          }
        })
      })

      await video.subscribe()

      session.dispatch(actions.socketMessageAction(firstRoom))
      session.dispatch(actions.socketMessageAction(secondRoom))

      await promise

      expect(mockExecute).toHaveBeenCalledTimes(2)
      expect(mockExecute).toHaveBeenNthCalledWith(1, {
        method: 'signalwire.subscribe',
        params: {
          get_initial_state: true,
          event_channel: eventChannelOne,
          events: ['video.member.joined', 'video.room.subscribed'],
        },
      })
      expect(mockExecute).toHaveBeenNthCalledWith(2, {
        method: 'signalwire.subscribe',
        params: {
          get_initial_state: true,
          event_channel: eventChannelTwo,
          events: ['video.member.joined', 'video.room.subscribed'],
        },
      })

      // Check room.name exposed
      expect(mockNameCheck).toHaveBeenCalledTimes(2)
      expect(mockNameCheck).toHaveBeenNthCalledWith(1, 'First Room')
      expect(mockNameCheck).toHaveBeenNthCalledWith(2, 'Second Room')
    })
  })

  describe('video.room.ended event', () => {
    const roomEndedEvent = JSON.parse(
      `{"jsonrpc":"2.0","id":"uuid2","method":"signalwire.event","params":{"params":{"room":{"recording":false,"room_session_id":"session-one","name":"First Room","hide_video_muted":false,"music_on_hold":false,"room_id":"room_id","event_channel":"room.<uuid-one>"},"room_session_id":"session-one","room_id":"room_id","room_session":{"recording":false,"name":"First Room","hide_video_muted":false,"id":"session-one","music_on_hold":false,"room_id":"room_id","event_channel":"room.<uuid-one>"}},"timestamp":1631692510.415,"event_type":"video.room.ended","event_channel":"video.rooms.4b7ae78a-d02e-4889-a63b-08b156d5916e"}}`
    )

    it('should pass a Room obj to the handler', (done) => {
      video.on('room.ended', (room) => {
        expect(room.id).toBe('session-one')
        expect(room.name).toBe('First Room')
        expect(room.videoMute).toBeDefined()
        expect(room.videoUnmute).toBeDefined()
        expect(room.getMembers).toBeDefined()
        expect(room.subscribe).toBeDefined()
        done()
      })

      video.subscribe().then(() => {
        session.dispatch(actions.socketMessageAction(roomEndedEvent))
      })
    })
  })

  describe('getRoomSessions()', () => {
    it('should be defined', () => {
      expect(video.getRoomSessions).toBeDefined()
      expect(video.getRoomSessions).toBeInstanceOf(Function)
    })

    it('should return an obj with a list of RoomSession objects', async () => {
      // @ts-expect-error
      ;(video.execute as jest.Mock).mockResolvedValueOnce({
        code: '200',
        message: 'OK',
        rooms: [
          {
            room_id: '776f0ece-75ce-4f84-8ce6-bd5677f2cbb9',
            id: '25ab8daa-2639-45ed-bc73-69b664f55eff',
            event_channel: 'EC_2404d4b8-fed1-48cc-8e84-9fd55d8cbd40',
            name: 'room-1',
            recording: true,
            hide_video_muted: false,
            layout_name: 'grid-responsive',
            display_name: 'themes',
            meta: {},
            members: [
              {
                id: 'f8e8be92-a2e7-4e00-84f5-f50322ee37d0',
                room_id: '776f0ece-75ce-4f84-8ce6-bd5677f2cbb9',
                room_session_id: '25ab8daa-2639-45ed-bc73-69b664f55eff',
                name: 'Tester',
                type: 'member',
                parent_id: '',
                requested_position: 'auto',
                visible: false,
                audio_muted: true,
                video_muted: true,
                deaf: false,
                input_volume: 0,
                output_volume: 0,
                input_sensitivity: 11.11111111111111,
                meta: null,
              },
            ],
          },
          {
            room_id: '088811be-8ecf-4f11-bfc1-45caa905130d',
            id: 'c22fa141-a3f0-4923-b44c-e49aa318c3dd',
            event_channel: 'EC_d28d0ec6-e233-46b0-8dac-5f1b33e95cf0',
            name: 'room-2',
            recording: false,
            hide_video_muted: false,
            layout_name: 'grid-responsive',
            display_name: 'sdk-room',
            meta: {},
            members: [
              {
                id: '725b616b-754f-4aaf-9517-fb5d1b358497',
                room_id: '088811be-8ecf-4f11-bfc1-45caa905130d',
                room_session_id: 'c22fa141-a3f0-4923-b44c-e49aa318c3dd',
                name: 'Testing',
                type: 'member',
                parent_id: '',
                requested_position: 'auto',
                visible: false,
                audio_muted: true,
                video_muted: true,
                deaf: false,
                input_volume: 0,
                output_volume: 0,
                input_sensitivity: 11.11111111111111,
                meta: null,
              },
            ],
          },
        ],
      })

      const result = await video.getRoomSessions()

      expect(result.roomSessions).toHaveLength(2)
      expect(result.roomSessions[0]).toBeInstanceOf(RoomSessionConsumer)
      expect(result.roomSessions[0].id).toBe(
        '25ab8daa-2639-45ed-bc73-69b664f55eff'
      )
      expect(result.roomSessions[0].roomId).toBe(
        '776f0ece-75ce-4f84-8ce6-bd5677f2cbb9'
      )
      expect(result.roomSessions[0].displayName).toBe('themes')
      expect(result.roomSessions[0].recording).toBe(true)
      expect(result.roomSessions[0].members).toHaveLength(1)

      expect(result.roomSessions[1]).toBeInstanceOf(RoomSessionConsumer)
      expect(result.roomSessions[1].id).toBe(
        'c22fa141-a3f0-4923-b44c-e49aa318c3dd'
      )
      expect(result.roomSessions[1].roomId).toBe(
        '088811be-8ecf-4f11-bfc1-45caa905130d'
      )
      expect(result.roomSessions[1].displayName).toBe('sdk-room')
      expect(result.roomSessions[1].recording).toBe(false)
      expect(result.roomSessions[1].members).toHaveLength(1)
    })
  })

  describe('getRoomSessionById()', () => {
    it('should be defined', () => {
      expect(video.getRoomSessionById).toBeDefined()
      expect(video.getRoomSessionById).toBeInstanceOf(Function)
    })

    it('should return a RoomSession object', async () => {
      // @ts-expect-error
      ;(video.execute as jest.Mock).mockResolvedValueOnce({
        room: {
          room_id: '776f0ece-75ce-4f84-8ce6-bd5677f2cbb9',
          id: '25ab8daa-2639-45ed-bc73-69b664f55eff',
          event_channel: 'EC_2404d4b8-fed1-48cc-8e84-9fd55d8cbd40',
          name: 'room-1',
          recording: true,
          hide_video_muted: false,
          layout_name: 'grid-responsive',
          display_name: 'themes',
          meta: {},
          members: [
            {
              id: 'f8e8be92-a2e7-4e00-84f5-f50322ee37d0',
              room_id: '776f0ece-75ce-4f84-8ce6-bd5677f2cbb9',
              room_session_id: '25ab8daa-2639-45ed-bc73-69b664f55eff',
              name: 'Tester',
              type: 'member',
              parent_id: '',
              requested_position: 'auto',
              visible: false,
              audio_muted: true,
              video_muted: true,
              deaf: false,
              input_volume: 0,
              output_volume: 0,
              input_sensitivity: 11.11111111111111,
              meta: null,
            },
          ],
        },
        code: '200',
        message: 'OK',
      })

      const result = await video.getRoomSessionById(
        '25ab8daa-2639-45ed-bc73-69b664f55eff'
      )

      expect(result.roomSession).toBeInstanceOf(RoomSessionConsumer)
      expect(result.roomSession.id).toBe('25ab8daa-2639-45ed-bc73-69b664f55eff')
      expect(result.roomSession.roomId).toBe(
        '776f0ece-75ce-4f84-8ce6-bd5677f2cbb9'
      )
      expect(result.roomSession.displayName).toBe('themes')
      expect(result.roomSession.recording).toBe(true)
      expect(result.roomSession.members).toHaveLength(1)
    })
  })
})
