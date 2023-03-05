import { CppRequest, CppResponse } from "../../../../Shared/compiled_proto/cpp";
import { ContainerData } from "../classes";

export enum WorkerMessageType {
  UpdateContainer,
  TaskResult,
  NewTask,
  Log,
  SetContainersData,
  StopTask,
  Error,
}
export interface WorkerMessage {
  type: WorkerMessageType;
  cppRequest: CppRequest;
  container: ContainerData;
  log: string;
  containers: ContainerData[];
  cppResponse: CppResponse;
  error: any;
}
