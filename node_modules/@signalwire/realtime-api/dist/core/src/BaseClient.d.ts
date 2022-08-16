import { BaseClientOptions } from './utils/interfaces';
import { BaseComponent } from './BaseComponent';
import { EventEmitter } from './utils/EventEmitter';
export declare class BaseClient<EventTypes extends EventEmitter.ValidEventTypes> extends BaseComponent<EventTypes> {
    options: BaseClientOptions<EventTypes>;
    constructor(options: BaseClientOptions<EventTypes>);
    /**
     * Connect the underlay WebSocket connection to the SignalWire network.
     *
     * @returns Promise that will resolve with the Client object.
     */
    connect(): Promise<this>;
    /**
     * Disconnect the Client from the SignalWire network.
     */
    disconnect(): void;
}
//# sourceMappingURL=BaseClient.d.ts.map