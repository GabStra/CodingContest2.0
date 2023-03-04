/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "rpc";

export interface CppRequest {
  id: string;
  code: string;
  input: string;
}

export interface CppResponse {
  id: string;
  console: string;
  output: string;
  timeout: boolean;
  error: string;
}

function createBaseCppRequest(): CppRequest {
  return { id: "", code: "", input: "" };
}

export const CppRequest = {
  encode(message: CppRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): CppRequest {
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

  fromJSON(object: any): CppRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      code: isSet(object.code) ? String(object.code) : "",
      input: isSet(object.input) ? String(object.input) : "",
    };
  },

  toJSON(message: CppRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.code !== undefined && (obj.code = message.code);
    message.input !== undefined && (obj.input = message.input);
    return obj;
  },

  create(base?: DeepPartial<CppRequest>): CppRequest {
    return CppRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CppRequest>): CppRequest {
    const message = createBaseCppRequest();
    message.id = object.id ?? "";
    message.code = object.code ?? "";
    message.input = object.input ?? "";
    return message;
  },
};

function createBaseCppResponse(): CppResponse {
  return { id: "", console: "", output: "", timeout: false, error: "" };
}

export const CppResponse = {
  encode(message: CppResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): CppResponse {
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

  fromJSON(object: any): CppResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      console: isSet(object.console) ? String(object.console) : "",
      output: isSet(object.output) ? String(object.output) : "",
      timeout: isSet(object.timeout) ? Boolean(object.timeout) : false,
      error: isSet(object.error) ? String(object.error) : "",
    };
  },

  toJSON(message: CppResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.console !== undefined && (obj.console = message.console);
    message.output !== undefined && (obj.output = message.output);
    message.timeout !== undefined && (obj.timeout = message.timeout);
    message.error !== undefined && (obj.error = message.error);
    return obj;
  },

  create(base?: DeepPartial<CppResponse>): CppResponse {
    return CppResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CppResponse>): CppResponse {
    const message = createBaseCppResponse();
    message.id = object.id ?? "";
    message.console = object.console ?? "";
    message.output = object.output ?? "";
    message.timeout = object.timeout ?? false;
    message.error = object.error ?? "";
    return message;
  },
};

export type CppDefinition = typeof CppDefinition;
export const CppDefinition = {
  name: "Cpp",
  fullName: "rpc.Cpp",
  methods: {
    runCpp: {
      name: "RunCpp",
      requestType: CppRequest,
      requestStream: false,
      responseType: CppResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface CppServiceImplementation<CallContextExt = {}> {
  runCpp(request: CppRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CppResponse>>;
}

export interface CppClient<CallOptionsExt = {}> {
  runCpp(request: DeepPartial<CppRequest>, options?: CallOptions & CallOptionsExt): Promise<CppResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
