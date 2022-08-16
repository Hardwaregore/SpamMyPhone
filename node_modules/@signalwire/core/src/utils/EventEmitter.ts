import EventEmitter from 'eventemitter3'

const REQUIRED_EMITTER_METHODS = [
  'on',
  'off',
  'once',
  'removeAllListeners',
  'emit',
]

/**
 * Checks the shape of the emitter at runtime. This is useful for when
 * the user is using the SDK without TS
 */
const assertEventEmitter = (emitter: unknown): emitter is EventEmitter => {
  if (
    emitter &&
    typeof emitter === 'object' &&
    REQUIRED_EMITTER_METHODS.every((name) => name in emitter)
  ) {
    return true
  }

  return false
}

const getEventEmitter = <T extends EventEmitter.ValidEventTypes>() => {
  return new EventEmitter<T>()
}

export { assertEventEmitter, EventEmitter, getEventEmitter }
