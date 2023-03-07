import { MessagePort } from "worker_threads";

export enum Recipient {
  LoadBalancer,
  DockerManager,
  TaskManager,
  CppService,
}

export interface PortMessage {
  recipient: Recipient;
  port: MessagePort;
}
