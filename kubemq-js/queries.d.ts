import { BaseMessage, Client, TypedEvent } from './client';
import { Config } from './config';
/**
 * queries request base message
 */
export interface QueriesMessage extends BaseMessage {
    timeout?: number;
    cacheKey?: string;
    cacheTTL?: number;
}
/**
 * query request received by queries subscriber
 */
export interface QueriesReceiveMessage {
    /** send query request id */
    id: string;
    /** channel name */
    channel: string;
    /** query request metadata */
    metadata: string;
    /** query request payload */
    body: Uint8Array | string;
    /** query request key/value tags */
    tags: Map<string, string>;
    /** query request replay channel for response */
    replyChannel: string;
}
/**
 * query response
 */
export interface QueriesResponse {
    /** send command request id */
    id: string;
    /** query response replay channel*/
    replyChannel?: string;
    /** clientId name of the responder*/
    clientId: string;
    /** response timestamp in Unix Epoch time*/
    timestamp: number;
    /** indicates execution of the query request*/
    executed: boolean;
    /** execution error if present*/
    error: string;
    /** response metadata*/
    metadata?: string;
    /** response payload*/
    body?: Uint8Array | string;
    /** response key/value tags*/
    tags?: Map<string, string>;
}
/** query requests subscription */
export interface QueriesSubscriptionRequest {
    /** query requests channel */
    channel: string;
    /** query requests channel group*/
    group?: string;
    /** query requests clientId */
    clientId?: string;
}
/** queries requests subscription callback */
export interface QueriesReceiveMessageCallback {
    (err: Error | null, msg: QueriesReceiveMessage): void;
}
/** queries requests subscription response*/
export interface QueriesSubscriptionResponse {
    onState: TypedEvent<string>;
    /** call unsubscribe*/
    unsubscribe(): void;
}
/**
 * Queries Client - KubeMQ queries client
 */
export declare class QueriesClient extends Client {
    /**
     * @internal
     */
    constructor(Options: Config);
    /**
     * Send query request to server and waits for response
     * @param msg
     * @return Promise<QueriesResponse>
     */
    send(msg: QueriesMessage): Promise<QueriesResponse>;
    /**
     * Send response for a query request to the server
     * @param msg
     * @return Promise<void>
     */
    response(msg: QueriesResponse): Promise<void>;
    /**
     * Subscribe to commands requests
     * @param request
     * @param cb
     * @return Promise<QueriesSubscriptionResponse>
     */
    subscribe(request: QueriesSubscriptionRequest, cb: QueriesReceiveMessageCallback): Promise<QueriesSubscriptionResponse>;
    private subscribeFn;
}
//# sourceMappingURL=queries.d.ts.map