"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueriesClient = void 0;
const tslib_1 = require("tslib");
const client_1 = require("./client");
const pb = require("./protos");
const utils_1 = require("./utils");
/**
 * Queries Client - KubeMQ queries client
 */
class QueriesClient extends client_1.Client {
    /**
     * @internal
     */
    constructor(Options) {
        super(Options);
    }
    /**
     * Send query request to server and waits for response
     * @param msg
     * @return Promise<QueriesResponse>
     */
    send(msg) {
        const pbMessage = new pb.Request();
        pbMessage.setRequestid(msg.id ? msg.id : utils_1.Utils.uuid());
        pbMessage.setClientid(msg.clientId ? msg.clientId : this.clientOptions.clientId);
        pbMessage.setChannel(msg.channel);
        pbMessage.setReplychannel(msg.channel);
        pbMessage.setBody(msg.body);
        pbMessage.setMetadata(msg.metadata);
        if (msg.tags != null) {
            pbMessage.getTagsMap().set(msg.tags);
        }
        pbMessage.setTimeout(msg.timeout ? msg.timeout : this.clientOptions.defaultRpcTimeout);
        pbMessage.setRequesttypedata(2);
        pbMessage.setCachekey(msg.cacheKey ? msg.cacheKey : '');
        pbMessage.setCachettl(msg.cacheTTL ? msg.cacheTTL : 0);
        return new Promise((resolve, reject) => {
            this.grpcClient.sendRequest(pbMessage, this.getMetadata(), (e, response) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve({
                    id: response.getRequestid(),
                    clientId: response.getClientid(),
                    error: response.getError(),
                    executed: response.getExecuted(),
                    timestamp: response.getTimestamp(),
                    body: response.getBody(),
                    metadata: response.getMetadata(),
                    tags: response.getTagsMap(),
                });
            });
        });
    }
    /**
     * Send response for a query request to the server
     * @param msg
     * @return Promise<void>
     */
    response(msg) {
        const pbMessage = new pb.Response();
        pbMessage.setRequestid(msg.id);
        pbMessage.setClientid(msg.clientId ? msg.clientId : this.clientOptions.clientId);
        pbMessage.setReplychannel(msg.replyChannel);
        pbMessage.setError(msg.error);
        pbMessage.setExecuted(msg.executed);
        pbMessage.setBody(msg.body);
        pbMessage.setMetadata(msg.metadata);
        if (msg.tags != null) {
            pbMessage.getTagsMap().set(msg.tags);
        }
        return new Promise((resolve, reject) => {
            this.grpcClient.sendResponse(pbMessage, this.getMetadata(), (e) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve();
            });
        });
    }
    /**
     * Subscribe to commands requests
     * @param request
     * @param cb
     * @return Promise<QueriesSubscriptionResponse>
     */
    subscribe(request, cb) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!request) {
                    reject(new Error('queries subscription requires a request object'));
                    return;
                }
                if (request.channel === '') {
                    reject(new Error('queries subscription requires a non empty request channel'));
                    return;
                }
                if (!cb) {
                    reject(new Error('queries subscription requires a callback'));
                    return;
                }
                let unsubscribe = false;
                const onStateChange = new client_1.TypedEvent();
                resolve({
                    onState: onStateChange,
                    unsubscribe() {
                        unsubscribe = true;
                    },
                });
                let currentStream;
                while (!unsubscribe) {
                    onStateChange.emit('connecting');
                    yield this.subscribeFn(request, cb).then((value) => {
                        value.onClose.on(() => {
                            isClosed = true;
                            onStateChange.emit('disconnected');
                        });
                        currentStream = value.stream;
                    });
                    let isClosed = false;
                    onStateChange.emit('connected');
                    while (!isClosed && !unsubscribe) {
                        yield new Promise((r) => setTimeout(r, 1000));
                    }
                    const reconnectionInterval = this.clientOptions.reconnectInterval;
                    if (reconnectionInterval === 0) {
                        unsubscribe = true;
                    }
                    else {
                        yield new Promise((r) => setTimeout(r, reconnectionInterval));
                    }
                }
                currentStream.cancel();
            }));
        });
    }
    subscribeFn(request, cb) {
        return new Promise((resolve, reject) => {
            if (!cb) {
                reject(new Error('queries subscription requires a callback'));
                return;
            }
            const pbSubRequest = new pb.Subscribe();
            pbSubRequest.setClientid(request.clientId ? request.clientId : this.clientOptions.clientId);
            pbSubRequest.setGroup(request.group ? request.group : '');
            pbSubRequest.setChannel(request.channel);
            pbSubRequest.setSubscribetypedata(4);
            const stream = this.grpcClient.subscribeToRequests(pbSubRequest, this.getMetadata());
            stream.on('data', function (data) {
                cb(null, {
                    id: data.getRequestid(),
                    channel: data.getChannel(),
                    metadata: data.getMetadata(),
                    body: data.getBody(),
                    tags: data.getTagsMap(),
                    replyChannel: data.getReplychannel(),
                });
            });
            stream.on('error', (e) => {
                cb(e, null);
            });
            let onClose = new client_1.TypedEvent();
            stream.on('close', () => {
                onClose.emit();
            });
            resolve({
                onClose: onClose,
                stream: stream,
            });
        });
    }
}
exports.QueriesClient = QueriesClient;
//# sourceMappingURL=queries.js.map