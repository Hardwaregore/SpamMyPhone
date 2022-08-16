import WS from 'jest-websocket-mock'
import { Client } from './MessagingClient'
import { Message } from './Message'

describe('MessagingClient', () => {
  describe('Client', () => {
    const host = 'ws://localhost:1234'
    let server: WS
    const authError = {
      code: -32002,
      message:
        'Authentication service failed with status ProtocolError, 401 Unauthorized: {}',
    }

    beforeEach(async () => {
      server = new WS(host)
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
      it('should handle messaging.receive payloads', (done) => {
        const messagePayload = {
          message_id: 'f6e0ee46-4bd4-4856-99bb-0f3bc3d3e787',
          context: 'foo',
          direction: 'inbound' as const,
          tags: ['Custom', 'client', 'data'],
          from_number: '+1234567890',
          to_number: '+12345698764',
          body: 'Message Body',
          media: ['url1', 'url2'],
          segments: 1,
          message_state: 'received',
        }
        const messaging = new Client({
          host,
          project: 'some-project',
          token: 'some-token',
          contexts: ['foo'],
        })

        messaging.on('message.received', (message) => {
          expect(message).toBeInstanceOf(Message)
          expect(message.id).toEqual(messagePayload.message_id)
          expect(message.context).toEqual(messagePayload.context)
          expect(message.body).toEqual(messagePayload.body)
          expect(message.media).toStrictEqual(messagePayload.media)
          expect(message.tags).toStrictEqual(messagePayload.tags)
          expect(message.segments).toStrictEqual(messagePayload.segments)

          messaging._session.removeAllListeners()
          messaging._session.disconnect()
          done()
        })

        messaging._session.once('session.connected', () => {
          server.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 'd42a7c46-c6c7-4f56-b52d-c1cbbcdc8125',
              method: 'signalwire.event',
              params: {
                event_type: 'messaging.receive',
                context: 'foo',
                timestamp: 123457.1234,
                space_id: 'uuid',
                project_id: 'uuid',
                params: messagePayload,
              },
            })
          )
        })
      })

      it('should handle messaging.state payloads', (done) => {
        const messagePayload = {
          message_id: '145cceb8-d4ed-4056-9696-f6775f950f2e',
          context: 'foo',
          direction: 'outbound',
          tag: null,
          tags: [],
          from_number: '+1xxx',
          to_number: '+1yyy',
          body: 'Hello World!',
          media: [],
          segments: 1,
          message_state: 'queued',
        }
        const messaging = new Client({
          host,
          project: 'some-project',
          token: 'some-other-token',
          contexts: ['foo'],
        })

        messaging.on('message.updated', (message) => {
          expect(message).toBeInstanceOf(Message)
          expect(message.id).toEqual(messagePayload.message_id)
          expect(message.context).toEqual(messagePayload.context)
          expect(message.body).toEqual(messagePayload.body)
          expect(message.media).toStrictEqual(messagePayload.media)
          expect(message.tags).toStrictEqual(messagePayload.tags)
          expect(message.segments).toStrictEqual(messagePayload.segments)

          messaging._session.disconnect()
          done()
        })

        messaging._session.once('session.connected', () => {
          server.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: 'd42a7c46-c6c7-4f56-b52d-c1cbbcdc8125',
              method: 'signalwire.event',
              params: {
                event_type: 'messaging.state',
                context: 'foo',
                timestamp: 123457.1234,
                space_id: 'uuid',
                project_id: 'uuid',
                params: messagePayload,
              },
            })
          )
        })
      })

      it('should show an error if client.connect failed to connect', (done) => {
        const logger = {
          error: jest.fn(),
          trace: jest.fn(),
          debug: jest.fn(),
          warn: jest.fn(),
        }
        const messaging = new Client({
          host,
          project: 'some-project',
          token: '<invalid-token>',
          logger: logger as any,
        })

        messaging.on('message.received', (_message) => {})

        messaging._session.on('session.auth_error', () => {
          expect(logger.error).toHaveBeenNthCalledWith(1, 'Auth Error', {
            code: -32002,
            message:
              'Authentication service failed with status ProtocolError, 401 Unauthorized: {}',
          })

          messaging._session.disconnect()
          done()
        })
      })
    })
  })
})
