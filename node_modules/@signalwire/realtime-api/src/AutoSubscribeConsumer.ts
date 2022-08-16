import {
  BaseComponentOptions,
  BaseConsumer,
  EventEmitter,
} from '@signalwire/core'

import { debounce } from './utils/debounce'

export class AutoSubscribeConsumer<
  EventTypes extends EventEmitter.ValidEventTypes
> extends BaseConsumer<EventTypes> {
  /** @internal */
  private debouncedSubscribe: ReturnType<typeof debounce>

  constructor(options: BaseComponentOptions<EventTypes>) {
    super(options)

    this.debouncedSubscribe = debounce(this.subscribe, 100)
  }

  override on(
    event: EventEmitter.EventNames<EventTypes>,
    fn: EventEmitter.EventListener<EventTypes, any>
  ) {
    const instance = super.on(event, fn)
    this.debouncedSubscribe()
    return instance
  }

  override once(
    event: EventEmitter.EventNames<EventTypes>,
    fn: EventEmitter.EventListener<EventTypes, any>
  ) {
    const instance = super.once(event, fn)
    this.debouncedSubscribe()
    return instance
  }
}
