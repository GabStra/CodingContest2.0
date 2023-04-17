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
  stdout: string;
  stderr: string;
  output: string;
  taskType: CppResponse_TaskType;
  taskStatus: CppResponse_TaskStatus;
}

export enum CppResponse_TaskType {
  COMPILE = 0,
  RUN = 1,
  UNRECOGNIZED = -1,
}

export function cppResponse_TaskTypeFromJSON(
  object: any
): CppResponse_TaskType {
  switch (object) {
    case 0:
    case "COMPILE":
      return CppResponse_TaskType.COMPILE;
    case 1:
    case "RUN":
      return CppResponse_TaskType.RUN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return CppResponse_TaskType.UNRECOGNIZED;
  }
}

export function cppResponse_TaskTypeToJSON(
  object: CppResponse_TaskType
): string {
  switch (object) {
    case CppResponse_TaskType.COMPILE:
      return "COMPILE";
    case CppResponse_TaskType.RUN:
      return "RUN";
    case CppResponse_TaskType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum CppResponse_TaskStatus {
  SUCCEDED = 0,
  ABORTED = 1,
  TIMEOUT = 2,
  ERROR = 3,
  FAILED = 4,
  UNRECOGNIZED = -1,
}

export function cppResponse_TaskStatusFromJSON(
  object: any
): CppResponse_TaskStatus {
  switch (object) {
    case 0:
    case "SUCCEDED":
      return CppResponse_TaskStatus.SUCCEDED;
    case 1:
    case "ABORTED":
      return CppResponse_TaskStatus.ABORTED;
    case 2:
    case "TIMEOUT":
      return CppResponse_TaskStatus.TIMEOUT;
    case 3:
    case "ERROR":
      return CppResponse_TaskStatus.ERROR;
    case 4:
    case "FAILED":
      return CppResponse_TaskStatus.FAILED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return CppResponse_TaskStatus.UNRECOGNIZED;
  }
}

export function cppResponse_TaskStatusToJSON(
  object: CppResponse_TaskStatus
): string {
  switch (object) {
    case CppResponse_TaskStatus.SUCCEDED:
      return "SUCCEDED";
    case CppResponse_TaskStatus.ABORTED:
      return "ABORTED";
    case CppResponse_TaskStatus.TIMEOUT:
      return "TIMEOUT";
    case CppResponse_TaskStatus.ERROR:
      return "ERROR";
    case CppResponse_TaskStatus.FAILED:
      return "FAILED";
    case CppResponse_TaskStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface HealthRequest {}

export interface HealthResponse {
  isHealthy: boolean;
  errorCounter: number;
}

function createBaseCppRequest(): CppRequest {
  return { id: "", code: "", input: "" };
}

export const CppRequest = {
  encode(
    message: CppRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
  return {
    id: "",
    stdout: "",
    stderr: "",
    output: "",
    taskType: 0,
    taskStatus: 0,
  };
}

export const CppResponse = {
  encode(
    message: CppResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.stdout !== "") {
      writer.uint32(18).string(message.stdout);
    }
    if (message.stderr !== "") {
      writer.uint32(26).string(message.stderr);
    }
    if (message.output !== "") {
      writer.uint32(34).string(message.output);
    }
    if (message.taskType !== 0) {
      writer.uint32(40).int32(message.taskType);
    }
    if (message.taskStatus !== 0) {
      writer.uint32(48).int32(message.taskStatus);
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
          message.stdout = reader.string();
          break;
        case 3:
          message.stderr = reader.string();
          break;
        case 4:
          message.output = reader.string();
          break;
        case 5:
          message.taskType = reader.int32() as any;
          break;
        case 6:
          message.taskStatus = reader.int32() as any;
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
      stdout: isSet(object.stdout) ? String(object.stdout) : "",
      stderr: isSet(object.stderr) ? String(object.stderr) : "",
      output: isSet(object.output) ? String(object.output) : "",
      taskType: isSet(object.taskType)
        ? cppResponse_TaskTypeFromJSON(object.taskType)
        : 0,
      taskStatus: isSet(object.taskStatus)
        ? cppResponse_TaskStatusFromJSON(object.taskStatus)
        : 0,
    };
  },

  toJSON(message: CppResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.stdout !== undefined && (obj.stdout = message.stdout);
    message.stderr !== undefined && (obj.stderr = message.stderr);
    message.output !== undefined && (obj.output = message.output);
    message.taskType !== undefined &&
      (obj.taskType = cppResponse_TaskTypeToJSON(message.taskType));
    message.taskStatus !== undefined &&
      (obj.taskStatus = cppResponse_TaskStatusToJSON(message.taskStatus));
    return obj;
  },

  create(base?: DeepPartial<CppResponse>): CppResponse {
    return CppResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CppResponse>): CppResponse {
    const message = createBaseCppResponse();
    message.id = object.id ?? "";
    message.stdout = object.stdout ?? "";
    message.stderr = object.stderr ?? "";
    message.output = object.output ?? "";
    message.taskType = object.taskType ?? 0;
    message.taskStatus = object.taskStatus ?? 0;
    return message;
  },
};

function createBaseHealthRequest(): HealthRequest {
  return {};
}

export const HealthRequest = {
  encode(
    _: HealthRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HealthRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHealthRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): HealthRequest {
    return {};
  },

  toJSON(_: HealthRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<HealthRequest>): HealthRequest {
    return HealthRequest.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<HealthRequest>): HealthRequest {
    const message = createBaseHealthRequest();
    return message;
  },
};

function createBaseHealthResponse(): HealthResponse {
  return { isHealthy: false, errorCounter: 0 };
}

export const HealthResponse = {
  encode(
    message: HealthResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.isHealthy === true) {
      writer.uint32(8).bool(message.isHealthy);
    }
    if (message.errorCounter !== 0) {
      writer.uint32(16).int32(message.errorCounter);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HealthResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHealthResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.isHealthy = reader.bool();
          break;
        case 2:
          message.errorCounter = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HealthResponse {
    return {
      isHealthy: isSet(object.isHealthy) ? Boolean(object.isHealthy) : false,
      errorCounter: isSet(object.errorCounter)
        ? Number(object.errorCounter)
        : 0,
    };
  },

  toJSON(message: HealthResponse): unknown {
    const obj: any = {};
    message.isHealthy !== undefined && (obj.isHealthy = message.isHealthy);
    message.errorCounter !== undefined &&
      (obj.errorCounter = Math.round(message.errorCounter));
    return obj;
  },

  create(base?: DeepPartial<HealthResponse>): HealthResponse {
    return HealthResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<HealthResponse>): HealthResponse {
    const message = createBaseHealthResponse();
    message.isHealthy = object.isHealthy ?? false;
    message.errorCounter = object.errorCounter ?? 0;
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
    isHealthy: {
      name: "IsHealthy",
      requestType: HealthRequest,
      requestStream: false,
      responseType: HealthResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface CppServiceImplementation<CallContextExt = {}> {
  runCpp(
    request: CppRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<CppResponse>>;
  isHealthy(
    request: HealthRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<HealthResponse>>;
}

export interface CppClient<CallOptionsExt = {}> {
  runCpp(
    request: DeepPartial<CppRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<CppResponse>;
  isHealthy(
    request: DeepPartial<HealthRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<HealthResponse>;
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
