import { ReduxComponent, SessionState, CustomSaga } from './interfaces';
import { SDKStore } from './';
import type { BaseComponent } from '../BaseComponent';
import { EventEmitter } from '../utils/EventEmitter';
declare type ComponentEventHandler = (component: ReduxComponent) => unknown;
declare type SessionEventHandler = (session: SessionState) => unknown;
interface Connect<T> {
    componentListeners: Record<string, string | ComponentEventHandler>;
    sessionListeners?: Partial<Record<ReduxSessionKeys, string | SessionEventHandler>>;
    store: SDKStore;
    Component: new (o: any) => T;
    customSagas?: Array<CustomSaga<T>>;
}
declare type ReduxSessionKeys = keyof SessionState;
export declare const connect: <EventTypes extends EventEmitter.ValidEventTypes, T extends BaseComponent<EventTypes, Record<string, unknown>>, TargetType>(options: Connect<T>) => (userOptions: any) => TargetType;
export {};
//# sourceMappingURL=connect.d.ts.map