"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueTransactionMessage = exports.QueuesClient = void 0;
const tslib_1 = require("tslib");
const client_1 = require("./client");
const pb = require("./protos");
const utils_1 = require("./utils");
/**
 * @internal
 */
const toQueueMessagePb = function (msg, defClientId) {
    const pbMessage = new pb.QueueMessage();
    pbMessage.setMessageid(msg.id ? msg.id : utils_1.Utils.uuid());
    pbMessage.setClientid(msg.clientId ? msg.clientId : defClientId);
    pbMessage.setChannel(msg.channel);
    pbMessage.setBody(msg.body);
    pbMessage.setMetadata(msg.metadata);
    if (msg.tags != null) {
        pbMessage.getTagsMap().set(msg.tags);
    }
    if (msg.policy != null) {
        const pbMessagePolicy = new pb.QueueMessagePolicy();
        pbMessagePolicy.setDelayseconds(msg.policy.delaySeconds ? msg.policy.delaySeconds : 0);
        pbMessagePolicy.setExpirationseconds(msg.policy.expirationSeconds ? msg.policy.expirationSeconds : 0);
        pbMessagePolicy.setMaxreceivecount(msg.policy.maxReceiveCount ? msg.policy.maxReceiveCount : 0);
        pbMessagePolicy.setMaxreceivequeue(msg.policy.maxReceiveQueue ? msg.policy.maxReceiveQueue : '');
        pbMessage.setPolicy(pbMessagePolicy);
    }
    return pbMessage;
};
/**
 * @internal
 */
const fromPbQueueMessage = function (msg) {
    let msgAttributes = {};
    const receivedMessageAttr = msg.getAttributes();
    if (receivedMessageAttr) {
        msgAttributes.delayedTo = receivedMessageAttr.getDelayedto();
        msgAttributes.expirationAt = receivedMessageAttr.getExpirationat();
        msgAttributes.receiveCount = receivedMessageAttr.getReceivecount();
        msgAttributes.reRouted = receivedMessageAttr.getRerouted();
        msgAttributes.reRoutedFromQueue = receivedMessageAttr.getReroutedfromqueue();
        msgAttributes.sequence = msg.getAttributes().getSequence();
        msgAttributes.timestamp = msg.getAttributes().getTimestamp();
    }
    return {
        id: msg.getMessageid(),
        channel: msg.getChannel(),
        clientId: msg.getClientid(),
        metadata: msg.getMetadata(),
        body: msg.getBody(),
        tags: msg.getTagsMap(),
        attributes: msgAttributes,
    };
};
/**
 * Queue Client - KubeMQ queues client
 */
class QueuesClient extends client_1.Client {
    /**
     * @internal
     */
    constructor(Options) {
        super(Options);
    }
    /**
     * Send queue message
     * @param msg
     * @return Promise<QueueMessageSendResult>
     */
    send(msg) {
        return new Promise((resolve, reject) => {
            this.grpcClient.sendQueueMessage(toQueueMessagePb(msg, this.clientOptions.clientId), this.getMetadata(), this.callOptions(), (e, response) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve({
                    id: response.getMessageid(),
                    sentAt: response.getSentat(),
                    delayedTo: response.getDelayedto(),
                    error: response.getError(),
                    expirationAt: response.getExpirationat(),
                    isError: response.getIserror(),
                });
            });
        });
    }
    /**
     * Send batch of queue messages
     * @param messages
     * @return Promise<QueueMessageSendResult[]>
     */
    batch(messages) {
        const pbBatchRequest = new pb.QueueMessagesBatchRequest();
        pbBatchRequest.setBatchid(utils_1.Utils.uuid());
        messages.forEach((msg) => {
            pbBatchRequest
                .getMessagesList()
                .push(toQueueMessagePb(msg, this.clientOptions.clientId));
        });
        return new Promise((resolve, reject) => {
            this.grpcClient.sendQueueMessagesBatch(pbBatchRequest, this.getMetadata(), this.callOptions(), (e, responseBatch) => {
                if (e) {
                    reject(e);
                    return;
                }
                const batchResp = [];
                responseBatch.getResultsList().forEach((response) => {
                    batchResp.push({
                        id: response.getMessageid(),
                        sentAt: response.getSentat(),
                        delayedTo: response.getDelayedto(),
                        error: response.getError(),
                        expirationAt: response.getExpirationat(),
                        isError: response.getIserror(),
                    });
                });
                resolve(batchResp);
            });
        });
    }
    /**
     * Pull batch of queue messages
     * @param request
     * @return Promise<QueuesPullPeekMessagesResponse>
     */
    pull(request) {
        return this.pullOrPeek(request, false);
    }
    /**
     * Peek batch of queue messages
     * @param request
     * @return Promise<QueuesPullPeekMessagesResponse>
     */
    peek(request) {
        return this.pullOrPeek(request, true);
    }
    /**
     * Subscribe is pulling messages in a loop batch of queue messages
     * @param request
     * @param cb
     * @return Promise<QueuesSubscribeMessagesResponse>
     */
    subscribe(request, cb) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!cb) {
                    reject(new Error('subscribeFn queue message call requires a callback'));
                    return;
                }
                let isCancelled = false;
                let onErrorEvent = new client_1.TypedEvent();
                const unsubscribe = () => {
                    isCancelled = true;
                };
                resolve({
                    onError: onErrorEvent,
                    unsubscribe: unsubscribe,
                });
                while (!isCancelled) {
                    yield this.pull(request)
                        .then((response) => {
                        cb(null, response);
                    })
                        .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        onErrorEvent.emit(reason);
                        yield new Promise((r) => setTimeout(r, this.clientOptions.reconnectInterval
                            ? this.clientOptions.reconnectInterval
                            : 1000));
                    }));
                }
            }));
        });
    }
    /**
     * @internal
     */
    pullOrPeek(request, isPeek) {
        const pbPullSubRequest = new pb.ReceiveQueueMessagesRequest();
        pbPullSubRequest.setClientid(request.clientId ? request.clientId : this.clientOptions.clientId);
        pbPullSubRequest.setChannel(request.channel);
        pbPullSubRequest.setIspeak(false);
        pbPullSubRequest.setRequestid(request.id ? request.id : utils_1.Utils.uuid());
        pbPullSubRequest.setMaxnumberofmessages(request.maxNumberOfMessages ? request.maxNumberOfMessages : 1);
        pbPullSubRequest.setWaittimeseconds(request.waitTimeoutSeconds ? request.waitTimeoutSeconds : 0);
        pbPullSubRequest.setIspeak(isPeek);
        return new Promise((resolve, reject) => {
            this.grpcClient.receiveQueueMessages(pbPullSubRequest, this.getMetadata(), (e, response) => {
                if (e) {
                    reject(e);
                    return;
                }
                const respMessages = [];
                response.getMessagesList().forEach((msg) => {
                    respMessages.push(fromPbQueueMessage(msg));
                });
                resolve({
                    id: response.getRequestid(),
                    messages: respMessages,
                    error: response.getError(),
                    isError: response.getIserror(),
                    isPeek: isPeek,
                    messagesExpired: response.getMessagesexpired(),
                    messagesReceived: response.getMessagesreceived(),
                });
            });
        });
    }
    /**
     * Ack all messages in queue
     * @param request
     * @return Promise<QueuesAckAllMessagesResponse>
     */
    ackAll(request) {
        const pbMessage = new pb.AckAllQueueMessagesRequest();
        pbMessage.setRequestid(request.id ? request.id : utils_1.Utils.uuid());
        pbMessage.setClientid(request.clientId ? request.clientId : this.clientOptions.clientId);
        pbMessage.setChannel(request.channel);
        pbMessage.setWaittimeseconds(request.waitTimeoutSeconds ? request.waitTimeoutSeconds : 0);
        return new Promise((resolve, reject) => this.grpcClient.ackAllQueueMessages(pbMessage, this.getMetadata(), this.callOptions(), (err, response) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                affectedMessages: response.getAffectedmessages(),
                error: response.getError(),
                id: response.getRequestid(),
                isError: response.getIserror(),
            });
        }));
    }
    /**
     * TransactionSubscribe is streaming transaction messages in a loop
     * @param request
     * @param cb
     * @return Promise<QueuesSubscribeMessagesResponse>
     */
    transactionStream(request, cb) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (!cb) {
                    reject(new Error('transaction subscription call requires a callback'));
                    return;
                }
                let isCancelled = false;
                let onErrorEvent = new client_1.TypedEvent();
                const unsubscribe = () => {
                    isCancelled = true;
                };
                resolve({
                    onError: onErrorEvent,
                    unsubscribe: unsubscribe,
                });
                while (!isCancelled) {
                    yield this.transaction(request, cb)
                        .then(() => { })
                        .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        onErrorEvent.emit(reason);
                        yield new Promise((r) => setTimeout(r, this.clientOptions.reconnectInterval
                            ? this.clientOptions.reconnectInterval
                            : 1000));
                    }));
                }
            }));
        });
    }
    /**
     * Start pull queue message transaction
     * @param request
     * @param cb
     * @return Promise<QueueTransactionRequest>
     */
    transaction(request, cb) {
        return new Promise((resolve, reject) => {
            if (!cb) {
                reject(new Error('transaction queue message call requires a callback'));
                return;
            }
            const stream = this.grpcClient.streamQueueMessage(this.getMetadata());
            stream.on('data', (result) => {
                if (result.getIserror()) {
                    cb(new Error(result.getError()), null);
                }
                else {
                    const msg = result.getMessage();
                    if (msg) {
                        cb(null, new QueueTransactionMessage(stream, fromPbQueueMessage(msg)));
                    }
                }
            });
            stream.on('error', (e) => {
                reject(e);
            });
            const msgRequest = new pb.StreamQueueMessagesRequest();
            msgRequest.setStreamrequesttypedata(1);
            msgRequest.setChannel(request.channel);
            msgRequest.setClientid(request.clientId ? request.clientId : this.clientOptions.clientId);
            msgRequest.setWaittimeseconds(request.waitTimeoutSeconds);
            msgRequest.setVisibilityseconds(request.visibilitySeconds);
            stream.write(msgRequest, (err) => {
                cb(err, null);
            });
            stream.on('end', () => {
                resolve();
            });
        });
    }
}
exports.QueuesClient = QueuesClient;
/**
 * @internal
 */
class QueueTransactionMessage {
    constructor(_stream, message) {
        this._stream = _stream;
        this.message = message;
    }
    ack() {
        return new Promise((resolve, reject) => {
            if (!this.message.attributes) {
                reject(new Error('no active queue msg to ack'));
                return;
            }
            const ackMessage = new pb.StreamQueueMessagesRequest();
            ackMessage.setStreamrequesttypedata(2);
            ackMessage.setRefsequence(this.message.attributes.sequence);
            ackMessage.setClientid(this.message.clientId);
            this._stream.write(ackMessage, (err) => {
                reject(err);
                return;
            });
            resolve();
        });
    }
    reject() {
        return new Promise((resolve, reject) => {
            if (!this.message.attributes) {
                reject(new Error('no active queue msg to reject'));
                return;
            }
            const rejectMessage = new pb.StreamQueueMessagesRequest();
            rejectMessage.setStreamrequesttypedata(3);
            rejectMessage.setRefsequence(this.message.attributes.sequence);
            rejectMessage.setClientid(this.message.clientId);
            this._stream.write(rejectMessage, (err) => {
                reject(err);
                return;
            });
            resolve();
        });
    }
    extendVisibility(newVisibilitySeconds) {
        return new Promise((resolve, reject) => {
            if (!this.message.attributes) {
                reject(new Error('no active queue msg to extend visibility'));
                return;
            }
            const visibilityMessage = new pb.StreamQueueMessagesRequest();
            visibilityMessage.setStreamrequesttypedata(4);
            visibilityMessage.setRefsequence(this.message.attributes.sequence);
            visibilityMessage.setVisibilityseconds(newVisibilitySeconds);
            visibilityMessage.setClientid(this.message.clientId);
            this._stream.write(visibilityMessage, (err) => {
                reject(err);
                return;
            });
            resolve();
        });
    }
    resendNewMessage(msg) {
        return new Promise((resolve, reject) => {
            if (!this.message.attributes) {
                reject(new Error('no active queue msg to extend visibility'));
                return;
            }
            const resendMessage = new pb.StreamQueueMessagesRequest();
            resendMessage.setStreamrequesttypedata(6);
            resendMessage.setModifiedmessage(toQueueMessagePb(msg, this.message.clientId));
            resendMessage.setClientid(this.message.clientId);
            this._stream.write(resendMessage, (err) => {
                reject(err);
                return;
            });
            resolve();
        });
    }
    resendToChannel(channel) {
        return new Promise((resolve, reject) => {
            if (!this.message.attributes) {
                reject(new Error('no active queue msg to extend visibility'));
                return;
            }
            const resendMessage = new pb.StreamQueueMessagesRequest();
            resendMessage.setStreamrequesttypedata(5);
            resendMessage.setChannel(channel);
            resendMessage.setClientid(this.message.clientId);
            this._stream.write(resendMessage, (err) => {
                reject(err);
                return;
            });
            resolve();
        });
    }
}
exports.QueueTransactionMessage = QueueTransactionMessage;
//# sourceMappingURL=queues.js.map