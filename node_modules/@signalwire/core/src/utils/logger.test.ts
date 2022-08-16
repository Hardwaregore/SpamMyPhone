import { getLogger, setLogger, setDebugOptions } from './logger'
import { createMockedLogger } from '../testUtils'
import { InternalSDKLogger } from '..'

describe('logger', () => {
  describe('getLogger', () => {
    it('should use the default logger if no logger was set', () => {
      const logger = getLogger()
      // @ts-expect-error
      expect(typeof logger.setLevel).toBe('function')
    })
  })

  describe('setLogger', () => {
    afterEach(() => {
      setLogger(null)
    })

    it('should allow us to pass a customer logger', () => {
      const mockedLogger = createMockedLogger()
      setLogger(mockedLogger)
      const logger = getLogger()

      logger.info('info')
      logger.debug('debug')
      logger.error('error')
      logger.trace('trace')
      logger.warn('warn')

      expect(mockedLogger.info).toHaveBeenCalledWith('info')
      expect(mockedLogger.debug).toHaveBeenCalledWith('debug')
      expect(mockedLogger.error).toHaveBeenCalledWith('error')
      expect(mockedLogger.trace).toHaveBeenCalledWith('trace')
      expect(mockedLogger.warn).toHaveBeenCalledWith('warn')
    })
  })

  describe('WS Traffic', () => {
    let mockedLogger: InternalSDKLogger
    beforeEach(() => {
      mockedLogger = createMockedLogger()
      setLogger(mockedLogger)
    })
    afterEach(() => {
      setLogger(null)
      setDebugOptions(null)
    })

    it('should be a noop unless `debug.logWsTraffic: true`', () => {
      const logger = getLogger()

      logger.wsTraffic({ type: 'send', payload: {} as any })

      expect(mockedLogger.info).not.toHaveBeenCalled()
    })

    it('should expose a `wsTraffic` method', () => {
      setDebugOptions({
        logWsTraffic: true,
      })
      const logger = getLogger()

      const payload = {
        jsonrpc: '2.0' as const,
        id: 'uuid',
        method: 'signalwire.event' as const,
        params: {
          key: 'value',
        },
      }

      logger.wsTraffic({ type: 'send', payload })
      logger.wsTraffic({ type: 'recv', payload })

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        1,
        `SEND: \n`,
        JSON.stringify(payload, null, 2),
        '\n'
      )

      expect(mockedLogger.info).toHaveBeenNthCalledWith(
        2,
        `RECV: \n`,
        JSON.stringify(payload, null, 2),
        '\n'
      )
    })

    it('should not stringify ping events', () => {
      setDebugOptions({
        logWsTraffic: true,
      })
      const logger = getLogger()

      const payload = {
        jsonrpc: '2.0' as const,
        id: 'uuid',
        method: 'signalwire.ping' as const,
        params: {
          key: 'value',
        },
      }

      logger.wsTraffic({ type: 'send', payload })

      expect(mockedLogger.info).toHaveBeenCalledWith(`SEND: \n`, payload, '\n')
    })
  })
})
