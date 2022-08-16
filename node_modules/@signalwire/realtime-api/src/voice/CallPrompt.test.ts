import { EventEmitter } from '@signalwire/core'
import { configureJestStore } from '../testUtils'
import {
  createCallPromptObject,
  CallPrompt,
  CallPromptEventsHandlerMapping,
} from './CallPrompt'

describe('CallPrompt', () => {
  describe('createCallPromptObject', () => {
    let instance: CallPrompt
    beforeEach(() => {
      instance = createCallPromptObject({
        store: configureJestStore(),
        emitter: new EventEmitter<CallPromptEventsHandlerMapping>(),
      })
      // @ts-expect-error
      instance.execute = jest.fn()
    })

    it('should control an active playback', async () => {
      // @ts-expect-error
      instance.callId = 'call_id'
      // @ts-expect-error
      instance.nodeId = 'node_id'
      // @ts-expect-error
      instance.controlId = 'control_id'

      const baseExecuteParams = {
        method: '',
        params: {
          call_id: 'call_id',
          node_id: 'node_id',
          control_id: 'control_id',
        },
      }

      await instance.stop()
      // @ts-expect-error
      expect(instance.execute).toHaveBeenLastCalledWith({
        ...baseExecuteParams,
        method: 'calling.play_and_collect.stop',
      })

      await instance.setVolume(5)
      // @ts-expect-error
      expect(instance.execute).toHaveBeenLastCalledWith({
        method: 'calling.play_and_collect.volume',
        params: {
          call_id: 'call_id',
          node_id: 'node_id',
          control_id: 'control_id',
          volume: 5,
        },
      })
    })
  })
})
