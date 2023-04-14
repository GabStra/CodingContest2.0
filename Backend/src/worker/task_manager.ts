import { MessagePort, parentPort } from "worker_threads";
import { CppDefinition, CppRequest } from "shared/compiled_proto/cpp";
import {
  ChannelCredentials,
  Client,
  createChannel,
  createClient,
} from "nice-grpc";

import { PortMessage, Recipient } from "../message/port_sharing";
import {
  CppServiceMessage,
  CppServiceMessageType,
} from "../message/cpp_service";
import {
  LoadBalancerMessage,
  LoadBalancerMessageType,
} from "../message/load_balancer";
import {
  TaskManagerMessage,
  TaskManagerMessageType,
} from "../message/task_manager";
import { Lock } from "async-await-mutex-lock";
import {
  DockerManagerMessage,
  DockerManagerMessageType,
  ContainerServiceData,
} from "../message/docker_manager";
import { WaitForMs } from "../helper/utils";
import { isAbortError } from "abort-controller-x";

interface ContainerData {
  serviceUrl: string;
  client: Client<CppDefinition>;
}

class TaskManager {
  servicePort: MessagePort | null = null;
  dockerPort: MessagePort | null = null;
  loadBalancerPort: MessagePort | null = null;
  abortByTaskId: Map<string, AbortController>;
  containerDataById: Map<string, ContainerData>;
  lock: Lock<unknown>;
  constructor() {
    this.containerDataById = new Map<string, ContainerData>();
    this.abortByTaskId = new Map<string, AbortController>();
    this.lock = new Lock();
  }

  async getClient(containerId: string) {
    await this.lock.acquire();
    let client = this.containerDataById.get(containerId)?.client;
    this.lock.release();
    return client;
  }

  async processTask(cppRequest: CppRequest, containerId: string) {
    let abortController = new AbortController();
    this.abortByTaskId.set(cppRequest.id, abortController);
    let client = await this.getClient(containerId);
    return await client?.runCpp(cppRequest, { signal: abortController.signal });
  }

  setServicePort(port: MessagePort) {
    this.servicePort = port;
    this.servicePort.on("message", async (msg: CppServiceMessage) => {
      switch (msg.type) {
        case CppServiceMessageType.StopTask:
          try {
            if (this.abortByTaskId.has(msg.taskId))
              this.abortByTaskId.get(msg.taskId)?.abort();
          } catch (error) {
            if (!isAbortError(error)) throw error;
          }

          return;
      }
    });
  }

  setLoadBalancerPort(port: MessagePort) {
    this.loadBalancerPort = port;
    this.loadBalancerPort.on("message", async (msg: LoadBalancerMessage) => {
      switch (msg.type) {
        case LoadBalancerMessageType.NewTask:
          try {
            let cppResponse = await this.processTask(
              msg.cppRequest,
              msg.containerId
            );
            this.servicePort?.postMessage({
              type: TaskManagerMessageType.TaskResult,
              cppResponse: cppResponse,
            } as TaskManagerMessage);
          } catch (error) {
            if (isAbortError(error)) {
              //TEST
            }

            this.servicePort?.postMessage({
              type: isAbortError(error)
                ? TaskManagerMessageType.TaskAbort
                : TaskManagerMessageType.TaskError,
              taskId: msg.cppRequest.id,
            } as TaskManagerMessage);
          } finally {
            this.loadBalancerPort?.postMessage({
              type: TaskManagerMessageType.FreeContainer,
              containerId: msg.containerId,
            } as TaskManagerMessage);
          }
          return;
      }
    });
  }

  addContainer(container: ContainerServiceData) {
    let channel = createChannel(
      container.serviceUrl,
      ChannelCredentials.createInsecure()
    );
    this.containerDataById.set(container.id, {
      serviceUrl: container.serviceUrl,
      client: createClient(CppDefinition, channel),
    } as ContainerData);
  }
  async updateAvailableContainers(containers: ContainerServiceData[]) {
    await this.lock.acquire();
    this.containerDataById.clear();
    containers.forEach((container) => this.addContainer(container));
    this.lock.release();
  }

  setDockerPort(port: MessagePort) {
    this.dockerPort = port;
    this.dockerPort.on("message", async (msg: DockerManagerMessage) => {
      switch (msg.type) {
        case DockerManagerMessageType.UpdateAvailableContainers:
          await this.updateAvailableContainers(msg.containersServiceData);
          this.dockerPort?.postMessage({
            type: TaskManagerMessageType.ChannelsReady,
          } as TaskManagerMessage);
          return;
      }
    });
  }
}

async function main() {
  const taskManager = new TaskManager();
  parentPort?.on("message", async (msg: PortMessage) => {
    switch (msg.recipient) {
      case Recipient.CppService:
        taskManager.setServicePort(msg.port);
        return;
      case Recipient.DockerManager:
        taskManager.setDockerPort(msg.port);
        return;
      case Recipient.LoadBalancer:
        taskManager.setLoadBalancerPort(msg.port);
        return;
    }
  });

  while (true) {
    await WaitForMs(500);
  }
}

main();
