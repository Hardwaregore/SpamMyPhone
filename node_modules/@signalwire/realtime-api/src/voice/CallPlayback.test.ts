import { EventEmitter } from '@signalwire/core'
import { configureJestStore } from '../testUtils'
import {
  createCallPlaybackObject,
  CallPlayback,
  CallPlaybackEventsHandlerMapping,
} from './CallPlayback'

describe('CallPlayback', () => {
  describe('createCallPlaybackObject', () => {
    let instance: CallPlayback
    beforeEach(() => {
      instance = createCallPlaybackObject({
        store: configureJestStore(),
        emitter: new EventEmitter<CallPlaybackEventsHandlerMapping>(),
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
      await instance.pause()
      // @ts-expect-error
      expect(instance.execute).toHaveBeenLastCalledWith({
        ...baseExecuteParams,
        method: 'calling.play.pause',
      })
      await instance.resume()
      // @ts-expect-error
      expect(instance.execute).toHaveBeenLastCalledWith({
        ...baseExecuteParams,
        method: 'calling.play.resume',
      })
      await instance.stop()
      // @ts-expect-error
      expect(instance.execute).toHaveBeenLastCalledWith({
        ...baseExecuteParams,
        method: 'calling.play.stop',
      })
      await instance.setVolume(2)
      // @ts-expect-error
      expect(instance.execute).toHaveBeenLastCalledWith({
        method: 'calling.play.volume',
        params: {
          call_id: 'call_id',
          node_id: 'node_id',
          control_id: 'control_id',
          volume: 2,
        },
      })
    })
  })
})
