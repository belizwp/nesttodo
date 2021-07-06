import { BaseMessage, Client, TypedEvent } from './client';
import { Config } from './config';
/**
 * command request base message
 */
export interface CommandsMessage extends BaseMessage {
    /** command request timeout in milliseconds */
    timeout?: number;
}
/**
 * command request received by commands subscriber
 */
export interface CommandsReceiveMessage {
    /** send command request id */
    id: string;
    /** channel name */
    channel: string;
    /** command request metadata */
    metadata: string;
    /** command request payload */
    body: Uint8Array | string;
    /** command request key/value tags */
    tags: Map<string, string>;
    /** command request replay channel for response */
    replyChannel: string;
}
/**
 * command response
 */
export interface CommandsResponse {
    /** send command request id */
    id: string;
    /** command response replay channel*/
    replyChannel?: string;
    /** clientId name of the responder*/
    clientId: string;
    /** response timestamp in Unix Epoch time*/
    timestamp: number;
    /** indicates execution of the command request*/
    executed: boolean;
    /** execution error if present*/
    error: string;
}
/** command requests subscription callback */
export interface CommandsReceiveMessageCallback {
    (err: Error | null, msg: CommandsReceiveMessage): void;
}
/** commands requests subscription */
export interface CommandsSubscriptionRequest {
    /** command requests channel */
    channel: string;
    /** command requests channel group*/
    group?: string;
    /** command requests clientId */
    clientId?: string;
}
/** commands requests subscription response*/
export interface CommandsSubscriptionResponse {
    onState: TypedEvent<string>;
    /** call unsubscribe*/
    unsubscribe(): void;
}
/**
 * Commands Client - KubeMQ commands client
 */
export declare class CommandsClient extends Client {
    /**
     * @internal
     */
    constructor(Options: Config);
    /**
     * Send command request to server and waits for response
     * @param msg
     * @return Promise<CommandsResponse>
     */
    send(msg: CommandsMessage): Promise<CommandsResponse>;
    /**
     * Send response for a command request to the server
     * @param msg
     * @return Promise<void>
     */
    response(msg: CommandsResponse): Promise<void>;
    /**
     * Subscribe to commands requests
     * @param request
     * @param cb
     * @return Promise<CommandsSubscriptionResponse>
     */
    subscribe(request: CommandsSubscriptionRequest, cb: CommandsReceiveMessageCallback): Promise<CommandsSubscriptionResponse>;
    private subscribeFn;
}
//# sourceMappingURL=commands.d.ts.map