import { CppRequest } from "shared/compiled_proto/cpp";

export enum CppServiceMessageType {
  StartTask,
  StopTask,
  CheckTask,
}

export interface CppServiceMessage {
  type: CppServiceMessageType;
  cppRequest: CppRequest;
  taskId: string;
}
