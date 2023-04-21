import { CppResponse } from "shared/dist/compiled_proto/cpp";

export enum TaskManagerMessageType {
  TaskResult,
  TaskError,
  FreeContainer,
  TaskAbort,
  ChannelsReady,
}

export interface TaskManagerMessage {
  type: TaskManagerMessageType;
  cppResponse: CppResponse;
  taskId: string;
  containerId: string;
}
