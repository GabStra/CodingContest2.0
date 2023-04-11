import { CppRequest } from "shared/compiled_proto/cpp";

export enum LoadBalancerMessageType {
  NewTask,
  TaskStatus,
}

export enum TaskStatus {
  Missing,
  Running,
  Waiting,
}

export interface LoadBalancerMessage {
  type: LoadBalancerMessageType;
  cppRequest: CppRequest;
  containerId: string;
  taskStatus: TaskStatus;
  taskId: string;
}
