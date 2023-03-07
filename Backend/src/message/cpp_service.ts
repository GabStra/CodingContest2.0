import { CppRequest } from "../../../Shared/compiled_proto/cpp";

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
