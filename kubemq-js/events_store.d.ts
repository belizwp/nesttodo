import { BaseMessage, Client, TypedEvent } from './client';
import { Config } from './config';
/**
 * events store subscription types
 */
export declare enum EventStoreType {
    StartNewOnly = 1,
    StartFromFirst = 2,
    StartFromLast = 3,
    StartAtSequence = 4,
    StartAtTime = 5,
    StartAtTimeDelta = 6
}
/**
 * events store base message
 */
export interface EventsStoreMessage extends BaseMessage {
}
/**
 * events store received by events store subscriber
 */
export interface EventsStoreReceiveMessage {
    /** send event request id */
    id: string;
    /** channel name */
    channel: string;
    /** event metadata */
    metadata: string;
    /** event payload */
    body: Uint8Array | string;
    /** event key/value tags */
    tags: Map<string, string>;
    /** event timestamp */
    timestamp: number;
    /** event sequence */
    sequence: number;
}
/** events store sending result */
export interface EventsStoreSendResult {
    id: string;
    sent: boolean;
    error: string;
}
/** events store subscription callback */
export interface EventsStoreReceiveMessageCallback {
    (err: Error | null, msg: EventsStoreReceiveMessage): void;
}
/** events store stream callback */
export interface EventsStoreStreamCallback {
    (err: Error | null, result: EventsStoreSendResult): void;
}
/** events store requests subscription */
export interface EventsStoreSubscriptionRequest {
    /** event store subscription channel */
    channel: string;
    /** event store subscription channel group*/
    group?: string;
    /** event store subscription clientId */
    clientId?: string;
    /** event store subscription type */
    requestType: EventStoreType;
    /** event store subscription value - if valid */
    requestTypeValue?: number;
}
/** events requests subscription response*/
export interface EventsStoreStreamResponse {
    /** emit events on close stream*/
    onClose: TypedEvent<void>;
    /** write events store to stream*/
    write(msg: EventsStoreMessage): void;
    /** end events store stream*/
    end(): void;
}
/** events store requests subscription response*/
export interface EventsStoreSubscriptionResponse {
    onState: TypedEvent<string>;
    /** call unsubscribe*/
    unsubscribe(): void;
}
/**
 * Events Store Client - KubeMQ events store client
 */
export declare class EventsStoreClient extends Client {
    /**
     * @internal
     */
    constructor(Options: Config);
    /**
     * Send single event
     * @param msg
     * @return Promise<EventsStoreSendResult>
     */
    send(msg: EventsStoreMessage): Promise<EventsStoreSendResult>;
    /**
     * Send stream of events store
     * @return Promise<EventsStoreStreamCallback>
     * @param cb
     */
    stream(cb: EventsStoreStreamCallback): Promise<EventsStoreStreamResponse>;
    /**
     * Subscribe to events store messages
     * @param request
     * @param cb
     * @return Promise<EventsStoreSubscriptionResponse>
     */
    subscribe(request: EventsStoreSubscriptionRequest, cb: EventsStoreReceiveMessageCallback): Promise<EventsStoreSubscriptionResponse>;
    private subscribeFn;
}
//# sourceMappingURL=events_store.d.ts.map