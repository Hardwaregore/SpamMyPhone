import {
  checkWebSocketHost,
  isLocalEvent,
  timeoutPromise,
  toLocalEvent,
  validateEventsToSubscribe,
} from './'
import { LOCAL_EVENT_PREFIX } from './constants'

describe('checkWebSocketHost', () => {
  it('should add wss protocol if not present', () => {
    expect(checkWebSocketHost('example.com')).toEqual('wss://example.com')
    expect(checkWebSocketHost('test.example.com:8082')).toEqual(
      'wss://test.example.com:8082'
    )
  })

  it('should do nothing if protocol is already present', () => {
    expect(checkWebSocketHost('ws://example.com')).toEqual('ws://example.com')
    expect(checkWebSocketHost('ws://example.com:8082')).toEqual(
      'ws://example.com:8082'
    )
    expect(checkWebSocketHost('wss://test.example.com')).toEqual(
      'wss://test.example.com'
    )
    expect(checkWebSocketHost('wss://test.example.com:8082')).toEqual(
      'wss://test.example.com:8082'
    )
  })
})

describe('timeoutPromise', () => {
  it('should resolve successfully without timeout', async () => {
    const promise = Promise.resolve('value')
    const error = 'ERROR'
    const result = await timeoutPromise(promise, 5, error)
    expect(result).toBe('value')
  })

  it('should reject in case of timeout', async () => {
    const promise = new Promise(() => null)
    const error = 'ERROR'
    await expect(timeoutPromise(promise, 5, error)).rejects.toEqual(error)
  })
})

describe('validateEventsToSubscribe', () => {
  it('should be no-op for valid event list', () => {
    const first = [
      'member.joined',
      'random.event.camelCase',
      'random.event.snake_case',
    ]
    expect(validateEventsToSubscribe(first)).toStrictEqual(first)
    const second = [
      'video.member.joined',
      'video.random.event.camelCase',
      'video.random.event.snake_case',
      'video.layout.changed',
      'video.member.updated',
      'video.member.left',
    ]
    expect(validateEventsToSubscribe(second)).toStrictEqual(second)
  })

  it('should check for custom-events', () => {
    const events = [
      'video.member.joined',
      'video.member.updated.videoMuted',
      'video.member.updated.visible',
    ]
    expect(validateEventsToSubscribe(events)).toStrictEqual([
      'video.member.joined',
      'video.member.updated',
    ])
  })

  it('should check for custom-events and make it unique', () => {
    const events = [
      'video.member.joined',
      'video.member.updated',
      'video.member.updated.videoMuted',
      'video.member.updated.visible',
    ]
    expect(validateEventsToSubscribe(events)).toStrictEqual([
      'video.member.joined',
      'video.member.updated',
    ])
  })

  it('should cleanup namespaced events', () => {
    const events = [
      '1111-2222-3333-4444:video.member.joined',
      '12345:video.member.updated',
      'video.member.ns_one',
      'video.member.ns_two',
    ]
    expect(validateEventsToSubscribe(events)).toStrictEqual([
      'video.member.joined',
      'video.member.updated',
      'video.member.ns_one',
      'video.member.ns_two',
    ])
  })

  it('should remove client-side events', () => {
    const events = [
      '1111-2222-3333-4444:video.member.joined',
      '12345:video.member.updated.audioMuted',
      'video.track',
      'video.active',
      'video.ringing',
    ]
    expect(validateEventsToSubscribe(events)).toStrictEqual([
      'video.member.joined',
      'video.member.updated',
    ])
  })
})

describe('toLocalEvent', () => {
  it('should convert the event to our local event syntax', () => {
    expect(toLocalEvent('video.room.started')).toEqual(
      `video.${LOCAL_EVENT_PREFIX}.room.started`
    )
  })
})

describe('isLocalEvent', () => {
  it('should identify when an event is local', () => {
    expect(isLocalEvent(toLocalEvent('video.room.started'))).toBeTruthy()
    expect(isLocalEvent('video.room.started')).toBeFalsy()
  })
})
