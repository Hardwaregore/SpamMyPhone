import { EventEmitter } from '@signalwire/core'
import { configureJestStore } from '../testUtils'
import {
  createCallRecordingObject,
  CallRecording,
  CallRecordingEventsHandlerMapping,
} from './CallRecording'

describe('CallRecording', () => {
  describe('createCallRecordingObject', () => {
    let instance: CallRecording
    beforeEach(() => {
      instance = createCallRecordingObject({
        store: configureJestStore(),
        emitter: new EventEmitter<CallRecordingEventsHandlerMapping>(),
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
        method: 'calling.record.stop',
      })
    })
  })
})
