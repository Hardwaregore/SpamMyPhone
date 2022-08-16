import { BaseConsumer, connect } from '.'
import { configureFullStack } from './testUtils'

describe('BaseConsumer', () => {
  describe('subscribe', () => {
    let instance: any
    let fullStack: ReturnType<typeof configureFullStack>

    beforeEach(() => {
      fullStack = configureFullStack()

      instance = connect({
        store: fullStack.store,
        componentListeners: {
          errors: 'onError',
          responses: 'onSuccess',
        },
        Component: BaseConsumer,
      })({
        emitter: fullStack.emitter,
      })
      instance.execute = jest.fn()
      instance._attachListeners(instance.__uuid)
    })

    afterEach(() => {
      fullStack.destroy()
    })

    it('should be idempotent', async () => {
      instance.on('something-1', () => {})
      instance.on('something-2', () => {})
      instance.on('something-2', () => {})

      await instance.subscribe()
      await instance.subscribe()
      await instance.subscribe()
      await instance.subscribe()
      await instance.subscribe()
      expect(instance.execute).toHaveBeenCalledTimes(1)
    })
  })
})
