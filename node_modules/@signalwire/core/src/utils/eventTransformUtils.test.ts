import { EventTransform } from './interfaces'
import {
  instanceProxyFactory,
  _instanceByTransformType,
} from './eventTransformUtils'
import { toExternalJSON } from './toExternalJSON'

describe('instanceProxyFactory', () => {
  const mockInstance = jest.fn()

  const payload = {
    nested: {
      id: 'random',
      snake_case: 'foo',
      camelCase: 'baz',
      otherTest: true,
      counter: 0,
    },
  }

  const transform: EventTransform = {
    // @ts-expect-error
    type: 'randomKey',
    instanceFactory: () => {
      return mockInstance
    },
    payloadTransform: (payload: any) => {
      return toExternalJSON(payload.nested)
    },
    getInstanceEventNamespace: (payload: any) => {
      return payload.nested.id
    },
    getInstanceEventChannel: (payload: any) => {
      return payload.nested.snake_case
    },
  }

  it('should return a cached Proxy object reading from the payload', () => {
    for (let i = 0; i < 4; i++) {
      const proxy = instanceProxyFactory({
        transform,
        payload: {
          nested: {
            ...payload.nested,
            counter: i,
          },
        },
      })

      expect(proxy.snakeCase).toBe('foo')
      expect(proxy.snake_case).toBeUndefined()
      expect(proxy.camelCase).toBe('baz')
      expect(proxy.otherTest).toBe(true)
      expect(proxy.counter).toBe(i)
      expect(proxy.eventChannel).toBe('foo')
      expect(proxy._eventsNamespace).toBe('random')
    }

    expect(_instanceByTransformType.size).toBe(1)
    expect(_instanceByTransformType.get('randomKey')).toBe(mockInstance)
  })

  it('should cache the instances by type', () => {
    const firstProxy = instanceProxyFactory({ transform, payload })
    expect(firstProxy.snakeCase).toBe('foo')

    const secondProxy = instanceProxyFactory({ transform, payload })
    expect(secondProxy.snakeCase).toBe('foo')

    expect(_instanceByTransformType.size).toBe(1)
    expect(_instanceByTransformType.get('randomKey')).toBe(mockInstance)

    const thirdProxy = instanceProxyFactory({
      transform: {
        ...transform,
        // @ts-expect-error
        type: 'otherKey',
      },
      payload,
    })
    expect(thirdProxy.snakeCase).toBe('foo')

    expect(_instanceByTransformType.size).toBe(2)
    expect(_instanceByTransformType.get('otherKey')).toBe(mockInstance)
  })

  it('should be serializable', async () => {
    const proxy = instanceProxyFactory({ transform, payload })

    expect(proxy.toString()).toMatchInlineSnapshot(
      `"{\\"id\\":\\"random\\",\\"snakeCase\\":\\"foo\\",\\"camelCase\\":\\"baz\\",\\"otherTest\\":true,\\"counter\\":0}"`
    )
  })
})
