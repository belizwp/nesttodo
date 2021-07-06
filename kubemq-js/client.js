"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEvent = exports.Client = void 0;
const kubemq = require("./protos");
const grpc = require("@grpc/grpc-js");
/**
 * @internal
 */
const defaultOptions = {
    address: 'localhost:50000',
    dialTimeout: 30000,
    defaultRpcTimeout: 60000,
    reconnectInterval: 1000,
};
/**
 * Client - Base class for client connectivity to KubeMQ
 */
class Client {
    constructor(Options) {
        this.clientOptions = Object.assign(Object.assign({}, defaultOptions), Options);
        this.init();
    }
    getMetadata() {
        return this.metadata;
    }
    init() {
        this.grpcClient = new kubemq.kubemqClient(this.clientOptions.address, this.getChannelCredentials());
        this.metadata = new grpc.Metadata();
        if (this.clientOptions.authToken != null) {
            this.metadata.add('authorization', this.clientOptions.authToken);
        }
    }
    callOptions() {
        return {
            deadline: new Date(Date.now() + this.clientOptions.dialTimeout),
        };
    }
    /**
     * @internal
     */
    getChannelCredentials() {
        if (this.clientOptions.credentials != null) {
            return grpc.credentials.createSsl(null, this.clientOptions.credentials.key, this.clientOptions.credentials.cert);
        }
        else {
            return grpc.credentials.createInsecure();
        }
    }
    /**
     * Ping - will send a ping message to KubeMQ server.
     * @return Promise<ServerInfo>
     */
    ping() {
        return new Promise((resolve, reject) => {
            this.grpcClient.ping(new kubemq.Empty(), (e, res) => {
                if (e) {
                    reject(e);
                }
                else {
                    const serverInfo = {
                        host: res.getHost(),
                        version: res.getVersion(),
                        serverStartTime: res.getServerstarttime(),
                        serverUpTimeSeconds: res.getServeruptimeseconds(),
                    };
                    resolve(serverInfo);
                }
            });
        });
    }
    close() {
        this.grpcClient.close();
    }
}
exports.Client = Client;
/** passes through events as they happen. You will not get events from before you start listening */
class TypedEvent {
    constructor() {
        this.listeners = [];
        this.listenersOncer = [];
        this.on = (listener) => {
            this.listeners.push(listener);
            return {
                dispose: () => this.off(listener),
            };
        };
        this.once = (listener) => {
            this.listenersOncer.push(listener);
        };
        this.off = (listener) => {
            const callbackIndex = this.listeners.indexOf(listener);
            if (callbackIndex > -1)
                this.listeners.splice(callbackIndex, 1);
        };
        this.emit = (event) => {
            /** Update any general listeners */
            this.listeners.forEach((listener) => listener(event));
            /** Clear the `once` queue */
            if (this.listenersOncer.length > 0) {
                const toCall = this.listenersOncer;
                this.listenersOncer = [];
                toCall.forEach((listener) => listener(event));
            }
        };
        this.pipe = (te) => {
            return this.on((e) => te.emit(e));
        };
    }
}
exports.TypedEvent = TypedEvent;
//# sourceMappingURL=client.js.map