import log from 'loglevel'
import type {
  SDKLogger,
  InternalSDKLogger,
  WsTrafficOptions,
  UserOptions,
} from '..'

const datetime = () =>
  new Date().toISOString().replace('T', ' ').replace('Z', '')
const defaultLogger = log.getLogger('signalwire')

const originalFactory = defaultLogger.methodFactory
defaultLogger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)

  return function () {
    const messages = [datetime(), '-']
    for (let i = 0; i < arguments.length; i++) {
      messages.push(arguments[i])
    }
    rawMethod.apply(undefined, messages)
  }
}

const defaultLoggerLevel =
  // @ts-ignore
  'development' === process.env.NODE_ENV
    ? defaultLogger.levels.DEBUG
    : defaultLogger.getLevel()
defaultLogger.setLevel(defaultLoggerLevel)

let userLogger: SDKLogger | null
const setLogger = (logger: SDKLogger | null) => {
  userLogger = logger
}

let debugOptions: UserOptions['debug'] = {}
const setDebugOptions = (options: any) => {
  if (options == null) {
    debugOptions = {}
    return
  }
  Object.assign(debugOptions, options)
}

const getLoggerInstance = (): SDKLogger => {
  return userLogger ?? (defaultLogger as any as SDKLogger)
}

const shouldStringify = (payload: WsTrafficOptions['payload']) => {
  if ('method' in payload && payload.method === 'signalwire.ping') {
    return false
  }

  return true
}

const wsTraffic: InternalSDKLogger['wsTraffic'] = ({ type, payload }) => {
  const logger = getLoggerInstance()
  const { logWsTraffic } = debugOptions || {}

  if (!logWsTraffic) {
    return undefined
  }

  const msg = shouldStringify(payload)
    ? JSON.stringify(payload, null, 2)
    : payload

  return logger.info(`${type.toUpperCase()}: \n`, msg, '\n')
}

const getLogger = (): InternalSDKLogger => {
  const logger = getLoggerInstance()

  return new Proxy(logger, {
    get(target, prop: keyof InternalSDKLogger, receiver) {
      if (prop === 'wsTraffic') {
        return wsTraffic
      }

      return Reflect.get(target, prop, receiver)
    },
  }) as InternalSDKLogger
}

export { setLogger, getLogger, setDebugOptions }
