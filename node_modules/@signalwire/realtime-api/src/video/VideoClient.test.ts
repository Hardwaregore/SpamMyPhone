import WS from 'jest-websocket-mock'
import { Client } from './VideoClient'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid'),
  }
})

describe('VideoClient', () => {
  describe('Client', () => {
    const host = 'ws://localhost:1234'
    const token = '<jwt>'
    let server: WS
    const authError = {
      code: -32002,
      message:
        'Authentication service failed with status ProtocolError, 401 Unauthorized: {}',
    }

    beforeEach(async () => {
      server = new WS(host, { jsonProtocol: true })
      server.on('connection', (socket: any) => {
        socket.on('message', (data: any) => {
          const parsedData = JSON.parse(data)

          if (
            parsedData.method === 'signalwire.connect' &&
            parsedData.params.authentication.token === '<invalid-token>'
          ) {
            socket.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id: parsedData.id,
                error: authError,
              })
            )
          }

          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: parsedData.id,
              result: {},
            })
          )
        })
      })
    })

    afterEach(() => {
      WS.clean()
    })

    describe('Automatic connect', () => {
      it('should automatically connect the underlying client', (done) => {
        const video = new Client({
          // @ts-expect-error
          host,
          project: 'some-project',
          token,
        })

        video.once('room.started', () => {})

        video._session.on('session.connected', () => {
          video._session.disconnect()

          done()
        })
      })

      it('should automatically connect the underlying client and send subscribe', async () => {
        const video = new Client({
          // @ts-expect-error
          host,
          project: 'some-project-x',
          token,
        })

        video.once('room.started', () => {})

        await server.connected

        await expect(server).toReceiveMessage({
          jsonrpc: '2.0',
          id: 'mocked-uuid',
          method: 'signalwire.connect',
          params: {
            version: { major: 3, minor: 0, revision: 0 },
            authentication: { project: 'some-project-x', token: '<jwt>' },
          },
        })
        await expect(server).toReceiveMessage({
          id: 'mocked-uuid',
          jsonrpc: '2.0',
          method: 'signalwire.subscribe',
          params: {
            event_channel: 'video.rooms',
            events: ['video.room.started'],
            get_initial_state: true,
          },
        })

        // FIXME: video.once start something async in background so we need to wait before disconnecting
        await new Promise((r) => setTimeout(r, 100))

        video._session.disconnect()
      })
    })

    it('should show an error if client.connect failed to connect', async () => {
      const logger = {
        error: jest.fn(),
        trace: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      }
      const video = new Client({
        // @ts-expect-error
        host,
        project: 'some-project',
        token: '<invalid-token>',
        logger: logger as any,
      })

      try {
        await video.subscribe()
      } catch (error) {
        expect(error).toStrictEqual(new Error('Unauthorized'))
        expect(logger.error).toHaveBeenNthCalledWith(1, 'Auth Error', {
          code: -32002,
          message:
            'Authentication service failed with status ProtocolError, 401 Unauthorized: {}',
        })
      } finally {
        video._session.disconnect()
      }
    })
  })
})
