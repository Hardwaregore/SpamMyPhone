import { EVENT_NAMESPACE_DIVIDER } from './constants'
import { toInternalEventName } from './toInternalEventName'

describe('toInternalEventName', () => {
  it('should use the EVENT_NAMESPACE_DIVIDER constant for namespacing the event', () => {
    const internalEvent = toInternalEventName({
      event: 'video.room.started',
      namespace: '1234',
    })

    expect(internalEvent).toEqual(
      `1234${EVENT_NAMESPACE_DIVIDER}video.room.started`
    )
  })

  it('should transform public events into internal without namespace', () => {
    const events = [
      // no-op
      ['video.room.started', 'video.room.started'],
      ['video.member.updated', 'video.member.updated'],
      ['video.member.updated.video_muted', 'video.member.updated.video_muted'],
      ['video.other_snake_case', 'video.other_snake_case'],
      // camel to snake
      ['video.member.updated.videoMuted', 'video.member.updated.video_muted'],
      ['video.member.otherSnakeCase', 'video.member.other_snake_case'],
      ['video.recording.exampleHere', 'video.recording.example_here'],
    ]
    const namespace = 'random-uuid'

    events.forEach(([input, output]) => {
      expect(toInternalEventName({ event: input })).toEqual(output)
      // @ts-ignore
      expect(toInternalEventName({ event: input, namespace: null })).toEqual(
        output
      )
      expect(toInternalEventName({ event: input, namespace: '' })).toEqual(
        output
      )
      expect(toInternalEventName({ event: input, namespace })).toEqual(
        `${namespace}:${output}`
      )
    })
  })

  it('should not add the namespace to events that are already namespaced', () => {
    const events = [
      {
        input: 'some-namespace:video.room.started',
        output: 'some-namespace:video.room.started',
        namespace: 'some-namespace',
      },
      {
        input: '111-222-333:video.member.updated',
        output: '111-222-333:video.member.updated',
        namespace: '111-222-333',
      },
      {
        input: 'xxxxxx:video.member.updated.video_muted',
        output: 'xxxxxx:video.member.updated.video_muted',
        namespace: 'xxxxxx',
      },
      {
        input: 'y_y:video.other_snake_case',
        output: 'y_y:video.other_snake_case',
        namespace: 'y_y',
      },
    ]

    events.forEach(({ input, output, namespace }) => {
      expect(toInternalEventName({ event: input, namespace })).toEqual(output)
    })
  })
})
