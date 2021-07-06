"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsStoreClient = exports.EventStoreType = void 0;
const tslib_1 = require("tslib");
const client_1 = require("./client");
const pb = require("./protos");
const utils_1 = require("./utils");
/**
 * events store subscription types
 */
var EventStoreType;
(function (EventStoreType) {
    EventStoreType[EventStoreType["StartNewOnly"] = 1] = "StartNewOnly";
    EventStoreType[EventStoreType["StartFromFirst"] = 2] = "StartFromFirst";
    EventStoreType[EventStoreType["StartFromLast"] = 3] = "StartFromLast";
    EventStoreType[EventStoreType["StartAtSequence"] = 4] = "StartAtSequence";
    EventStoreType[EventStoreType["StartAtTime"] = 5] = "StartAtTime";
    EventStoreType[EventStoreType["StartAtTimeDelta"] = 6] = "StartAtTimeDelta";
})(EventStoreType = exports.EventStoreType || (exports.EventStoreType = {}));
/**
 * Events Store Client - KubeMQ events store client
 */
class EventsStoreClient extends client_1.Client {
    /**
     * @internal
     */
    constructor(Options) {
        super(Options);
    }
    /**
     * Send single event
     * @param msg
     * @return Promise<EventsStoreSendResult>
     */
    send(msg) {
        const pbMessage = new pb.Event();
        pbMessage.setEventid(msg.id ? msg.id : utils_1.Utils.uuid());
        pbMessage.setClientid(msg.clientId ? msg.clientId : this.clientOptions.clientId);
        pbMessage.setChannel(msg.channel);
        pbMessage.setBody(msg.body);
        pbMessage.setMetadata(msg.metadata);
        if (msg.tags != null) {
            pbMessage.getTagsMap().set(msg.tags);
        }
        pbMessage.setStore(true);
        return new Promise((resolve, reject) => {
            this.grpcClient.sendEvent(pbMessage, this.getMetadata(), this.callOptions(), (e, result) => {
                if (e) {
                    reject(e);
                    return;
                }
                if (result != null)
                    resolve({
                        id: result.getEventid(),
                        sent: result.getSent(),
                        error: result.getError(),
                    });
            });
        });
    }
    /**
     * Send stream of events store
     * @return Promise<EventsStoreStreamCallback>
     * @param cb
     */
    stream(cb) {
        return new Promise((resolve, reject) => {
            if (!cb) {
                reject(new Error('stream events store call requires a callback'));
                return;
            }
            const stream = this.grpcClient.sendEventsStream(this.getMetadata());
            stream.on('data', (result) => {
                cb(null, {
                    id: result.getEventid(),
                    sent: result.getSent(),
                    error: result.getError(),
                });
            });
            stream.on('error', (e) => {
                cb(e, null);
            });
            let onCloseEvent = new client_1.TypedEvent();
            stream.on('close', () => {
                onCloseEvent.emit();
            });
            const writeFn = (msg) => {
                const pbMessage = new pb.Event();
                pbMessage.setEventid(msg.id ? msg.id : utils_1.Utils.uuid());
                pbMessage.setClientid(msg.clientId ? msg.clientId : this.clientOptions.clientId);
                pbMessage.setChannel(msg.channel);
                pbMessage.setBody(msg.body);
                pbMessage.setMetadata(msg.metadata);
                if (msg.tags != null) {
                    pbMessage.getTagsMap().set(msg.tags);
                }
                pbMessage.setStore(true);
                stream.write(pbMessage, (err) => {
                    cb(err, null);
                });
            };
            resolve({
                onClose: onCloseEvent,
                write: writeFn,
                end() {
                    stream.end();
                },
            });
        });
    }
    /**
     * Subscribe to events store messages
     * @param request
     * @param cb
     * @return Promise<EventsStoreSubscriptionResponse>
     */
    subscribe(request, cb) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!request) {
                    reject(new Error('events store subscription requires a request object'));
                    return;
                }
                if (request.channel === '') {
                    reject(new Error('events store subscription requires a non empty request channel'));
                    return;
                }
                if (!cb) {
                    reject(new Error('events store subscription requires a callback'));
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
                reject(new Error('events store subscription requires a callback'));
                return;
            }
            const pbSubRequest = new pb.Subscribe();
            pbSubRequest.setClientid(request.clientId ? request.clientId : this.clientOptions.clientId);
            pbSubRequest.setGroup(request.group ? request.group : '');
            pbSubRequest.setChannel(request.channel);
            pbSubRequest.setSubscribetypedata(2);
            pbSubRequest.setEventsstoretypedata(request.requestType);
            pbSubRequest.setEventsstoretypevalue(request.requestTypeValue);
            const stream = this.grpcClient.subscribeToEvents(pbSubRequest, this.getMetadata());
            stream.on('data', (data) => {
                cb(null, {
                    id: data.getEventid(),
                    channel: data.getChannel(),
                    metadata: data.getMetadata(),
                    body: data.getBody(),
                    tags: data.getTagsMap(),
                    timestamp: data.getTimestamp(),
                    sequence: data.getSequence(),
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
exports.EventsStoreClient = EventsStoreClient;
//# sourceMappingURL=events_store.js.map