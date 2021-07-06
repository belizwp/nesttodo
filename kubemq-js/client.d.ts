import { Config } from './config';
import * as kubemq from './protos';
import * as grpc from '@grpc/grpc-js';
/**
 * Server info object returned on Ping
 */
export interface ServerInfo {
    host: string;
    version: string;
    serverStartTime: number;
    serverUpTimeSeconds: number;
}
/**
 * @internal
 */
export interface BaseMessage {
    /** message id, a UUID id will generated when id is empty */
    id?: string;
    /** channel name */
    channel?: string;
    /** optional clientId name specific for this message*/
    clientId?: string;
    /** optional metadata string */
    metadata?: string;
    /** message payload */
    body?: Uint8Array | string;
    /** optional message tags key/value map */
    tags?: Map<string, string>;
}
/**
 * Client - Base class for client connectivity to KubeMQ
 */
export declare class Client {
    getMetadata(): grpc.Metadata;
    protected clientOptions: Config;
    protected grpcClient: kubemq.kubemqClient;
    private metadata;
    constructor(Options: Config);
    private init;
    protected callOptions(): grpc.CallOptions;
    /**
     * @internal
     */
    private getChannelCredentials;
    /**
     * Ping - will send a ping message to KubeMQ server.
     * @return Promise<ServerInfo>
     */
    ping(): Promise<ServerInfo>;
    close(): void;
}
export interface Listener<T> {
    (event: T): any;
}
export interface Disposable {
    dispose(): any;
}
/** passes through events as they happen. You will not get events from before you start listening */
export declare class TypedEvent<T> {
    private listeners;
    private listenersOncer;
    on: (listener: Listener<T>) => Disposable;
    once: (listener: Listener<T>) => void;
    off: (listener: Listener<T>) => void;
    emit: (event: T) => void;
    pipe: (te: TypedEvent<T>) => Disposable;
}
//# sourceMappingURL=client.d.ts.map