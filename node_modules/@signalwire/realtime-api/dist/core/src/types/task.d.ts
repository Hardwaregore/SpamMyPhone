import type { OnlyStateProperties, OnlyFunctionProperties } from '..';
export declare type TaskReceivedEventName = 'task.received';
export declare type TaskEventNames = TaskReceivedEventName;
export interface TaskContract {
}
export declare type TaskEntity = OnlyStateProperties<TaskContract>;
export declare type TaskMethods = Omit<OnlyFunctionProperties<TaskContract>, 'subscribe' | 'unsubscribe' | 'updateToken'>;
/**
 * ==========
 * ==========
 * Server-Side Events
 * ==========
 * ==========
 */
/**
 * 'queuing.relay.tasks'
 */
export interface TaskInboundEvent {
    event_type: 'queuing.relay.tasks';
    context: string;
    message: Record<string, unknown>;
    timestamp: number;
    space_id: string;
    project_id: string;
}
export declare type TaskEvent = TaskInboundEvent;
/**
 * TODO: update MapToPubSubShape in another PR
 * not used MapToPubSubShape because queuing.relay.tasks
 * has a different shape
 */
export declare type TaskAction = {
    type: TaskReceivedEventName;
    payload: TaskInboundEvent;
};
//# sourceMappingURL=task.d.ts.map