"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const uuid_1 = require("uuid");
class Utils {
    constructor() {
        throw new Error(`This class can't be initialized.`);
    }
    static uuid() {
        return uuid_1.v4();
    }
    static stringToBytes(str) {
        return Buffer.from(str);
    }
    static bytesToString(bytes) {
        if (typeof bytes === 'string') {
            return bytes;
        }
        return String.fromCharCode.apply(null, bytes);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map