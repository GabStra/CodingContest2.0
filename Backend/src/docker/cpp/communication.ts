import { CppRequest, CppResponse } from "../../../../Shared/compiled_proto/cpp";
import { ContainerData } from "../classes";

export enum WorkerMessageType {
  UpdateContainer,
  ReceiveTaskResult,
  ReceiveNewTask,
  SendNewTask,
  SendLog,
  SetContainersData,
  SendCppResponse,
  StopTask,
}
export interface WorkerMessage {
  type: WorkerMessageType;
  cppRequest: CppRequest;
  container: ContainerData;
  log: string;
  containers: ContainerData[];
  cppResponse: CppResponse;
}
