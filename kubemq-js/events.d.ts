import { BaseMessage, Client, TypedEvent } from './client';
import { Config } from './config';
/**
 * events base message
 */
export interface EventsMessage extends BaseMessage {
}
/**
 * events received by events subscriber
 */
export interface EventsReceiveMessage {
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
}
/** events subscription callback */
export interface EventsReceiveMessageCallback {
    (err: Error | null, msg: EventsReceiveMessage): void;
}
/** events stream callback */
export interface EventsStreamCallback {
    (err: Error | null, result: EventsSendResult): void;
}
/** events sending result */
export interface EventsSendResult {
    id: string;
    sent: boolean;
}
/** events requests subscription */
export interface EventsSubscriptionRequest {
    /** event subscription channel */
    channel: string;
    /** event subscription channel group*/
    group?: string;
    /** event subscription clientId */
    clientId?: string;
}
/** events store requests subscription response*/
export interface EventsSubscriptionResponse {
    onState: TypedEvent<string>;
    /** call unsubscribe*/
    unsubscribe(): void;
}
/** events requests subscription response*/
export interface EventsStreamResponse {
    /** emit events on close stream*/
    onClose: TypedEvent<void>;
    /** write events to stream*/
    write(msg: EventsMessage): void;
    /** end events stream*/
    end(): void;
}
/**
 * Events Client - KubeMQ events client
 */
export declare class EventsClient extends Client {
    /**
     * @internal
     */
    constructor(Options: Config);
    /**
     * Send single event
     * @param msg
     * @return Promise<EventsSendResult>
     */
    send(msg: EventsMessage): Promise<EventsSendResult>;
    /**
     * Send stream of events
     * @return Promise<EventsStreamResponse>
     * @param cb
     */
    stream(cb: EventsStreamCallback): Promise<EventsStreamResponse>;
    /**
     * Subscribe to events messages
     * @param request
     * @param cb
     * @return Promise<EventsSubscriptionResponse>
     */
    subscribe(request: EventsSubscriptionRequest, cb: EventsReceiveMessageCallback): Promise<EventsSubscriptionResponse>;
    private subscribeFn;
}
//# sourceMappingURL=events.d.ts.map