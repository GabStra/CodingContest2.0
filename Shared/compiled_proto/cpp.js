"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CppDefinition = exports.CppResponse = exports.CppRequest = exports.protobufPackage = void 0;
const _m0 = __importStar(require("protobufjs/minimal"));
exports.protobufPackage = "rpc";
function createBaseCppRequest() {
    return { id: "", code: "", input: "" };
}
exports.CppRequest = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.id !== "") {
            writer.uint32(10).string(message.id);
        }
        if (message.code !== "") {
            writer.uint32(18).string(message.code);
        }
        if (message.input !== "") {
            writer.uint32(26).string(message.input);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCppRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.code = reader.string();
                    break;
                case 3:
                    message.input = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            id: isSet(object.id) ? String(object.id) : "",
            code: isSet(object.code) ? String(object.code) : "",
            input: isSet(object.input) ? String(object.input) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.code !== undefined && (obj.code = message.code);
        message.input !== undefined && (obj.input = message.input);
        return obj;
    },
    create(base) {
        return exports.CppRequest.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseCppRequest();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : "";
        message.code = (_b = object.code) !== null && _b !== void 0 ? _b : "";
        message.input = (_c = object.input) !== null && _c !== void 0 ? _c : "";
        return message;
    },
};
function createBaseCppResponse() {
    return { id: "", console: "", output: "", timeout: false, error: "" };
}
exports.CppResponse = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.id !== "") {
            writer.uint32(10).string(message.id);
        }
        if (message.console !== "") {
            writer.uint32(18).string(message.console);
        }
        if (message.output !== "") {
            writer.uint32(26).string(message.output);
        }
        if (message.timeout === true) {
            writer.uint32(32).bool(message.timeout);
        }
        if (message.error !== "") {
            writer.uint32(42).string(message.error);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCppResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.console = reader.string();
                    break;
                case 3:
                    message.output = reader.string();
                    break;
                case 4:
                    message.timeout = reader.bool();
                    break;
                case 5:
                    message.error = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            id: isSet(object.id) ? String(object.id) : "",
            console: isSet(object.console) ? String(object.console) : "",
            output: isSet(object.output) ? String(object.output) : "",
            timeout: isSet(object.timeout) ? Boolean(object.timeout) : false,
            error: isSet(object.error) ? String(object.error) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.id !== undefined && (obj.id = message.id);
        message.console !== undefined && (obj.console = message.console);
        message.output !== undefined && (obj.output = message.output);
        message.timeout !== undefined && (obj.timeout = message.timeout);
        message.error !== undefined && (obj.error = message.error);
        return obj;
    },
    create(base) {
        return exports.CppResponse.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c, _d, _e;
        const message = createBaseCppResponse();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : "";
        message.console = (_b = object.console) !== null && _b !== void 0 ? _b : "";
        message.output = (_c = object.output) !== null && _c !== void 0 ? _c : "";
        message.timeout = (_d = object.timeout) !== null && _d !== void 0 ? _d : false;
        message.error = (_e = object.error) !== null && _e !== void 0 ? _e : "";
        return message;
    },
};
exports.CppDefinition = {
    name: "Cpp",
    fullName: "rpc.Cpp",
    methods: {
        runCpp: {
            name: "RunCpp",
            requestType: exports.CppRequest,
            requestStream: false,
            responseType: exports.CppResponse,
            responseStream: false,
            options: {},
        },
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
