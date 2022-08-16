import WS from 'jest-websocket-mock'
import { Client } from './ChatClient'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid'),
  }
})

describe('ChatClient', () => {
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
            return socket.send(
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
        const chat = new Client({
          // @ts-expect-error
          host,
          project: 'some-project',
          token,
        })

        chat.once('member.joined', () => {})

        chat._session.on('session.connected', () => {
          expect(server).toHaveReceivedMessages([
            {
              jsonrpc: '2.0',
              id: 'mocked-uuid',
              method: 'signalwire.connect',
              params: {
                version: { major: 3, minor: 0, revision: 0 },
                authentication: { project: 'some-project', token: '<jwt>' },
              },
            },
          ])

          chat._session.disconnect()

          done()
        })
      })
    })

    it('should show an error if client.connect failed to connect', async () => {
      const logger = {
        error: jest.fn(),
        info: jest.fn(),
        trace: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      }
      const chat = new Client({
        // @ts-expect-error
        host,
        project: 'some-project',
        token: '<invalid-token>',
        logger: logger as any,
      })

      try {
        await chat.subscribe('some-channel')
      } catch (error) {
        expect(error).toStrictEqual(new Error('Unauthorized'))
        expect(logger.error).toHaveBeenNthCalledWith(1, 'Auth Error', {
          code: -32002,
          message:
            'Authentication service failed with status ProtocolError, 401 Unauthorized: {}',
        })
      } finally {
        chat._session.disconnect()
      }
    })
  })
})
