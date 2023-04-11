import { Lock } from "async-await-mutex-lock";
import { Worker } from "worker_threads";
import { WaitForMs } from "../helper/utils";
import { CppRequest } from "shared/compiled_proto/cpp";
import { MessagePort, parentPort } from "worker_threads";
import { PortMessage, Recipient } from "../message/port_sharing";
import {
  CppServiceMessage,
  CppServiceMessageType,
} from "../message/cpp_service";
import {
  LoadBalancerMessage,
  LoadBalancerMessageType,
  TaskStatus,
} from "../message/load_balancer";
import {
  ContainerServiceData,
  DockerManagerMessage,
  DockerManagerMessageType,
} from "../message/docker_manager";
import {
  TaskManagerMessage,
  TaskManagerMessageType,
} from "../message/task_manager";

interface ContainerStatus {
  id: string;
  isBusy: boolean;
}

class LoadBalancer {
  servicePort: MessagePort | null = null;
  dockerPort: MessagePort | null = null;
  taskManagerPort: MessagePort | null = null;
  taskLock: Lock<unknown>;
  containersLock: Lock<unknown>;
  containersStatus: ContainerStatus[] = [];
  cppRequests: CppRequest[] = [];
  constructor() {
    this.taskLock = new Lock();
    this.containersLock = new Lock();
  }

  async ScheduleTask() {
    await this.taskLock.acquire();
    let stop = this.cppRequests.length === 0;
    this.taskLock.release();
    if (stop) return;

    await this.containersLock.acquire();

    let anyAvailableContainer = this.containersStatus.some((c) => !c.isBusy);

    if (!anyAvailableContainer) {
      this.containersLock.release();
      return;
    }
    let availableContainers = this.containersStatus.filter((c) => !c.isBusy);

    if (!availableContainers || availableContainers.length === 0) {
      return;
    }

    await this.taskLock.acquire();
    let container = availableContainers[0];
    let index = this.containersStatus.findIndex((c) => c.id === container.id);
    this.containersStatus[index].isBusy = true;
    let cppRequest = this.cppRequests.shift();
    this.taskManagerPort?.postMessage({
      type: LoadBalancerMessageType.NewTask,
      cppRequest: cppRequest,
      containerId: container.id,
    } as LoadBalancerMessage);
    this.taskLock.release();

    this.containersLock.release();
  }

  setServicePort(port: MessagePort) {
    this.servicePort = port;

    this.servicePort.on("message", async (msg: CppServiceMessage) => {
      switch (msg.type) {
        case CppServiceMessageType.StartTask:
          await this.taskLock.acquire();
          this.cppRequests.push(msg.cppRequest);
          this.taskLock.release();
          return;
        case CppServiceMessageType.CheckTask:
          await this.taskLock.acquire();
          this.servicePort?.postMessage({
            type: LoadBalancerMessageType.TaskStatus,
            taskStatus: this.cppRequests.some((c) => c.id === msg.taskId)
              ? TaskStatus.Waiting
              : TaskStatus.Missing,
          } as LoadBalancerMessage);
          this.taskLock.release();
          return;
      }
    });
  }

  addContainer(container: ContainerServiceData) {
    this.containersStatus.push({
      id: container.id,
      isBusy: false,
    } as ContainerStatus);
  }

  async updateAvailableContainers(containers: ContainerServiceData[]) {
    await this.containersLock.acquire();
    this.containersStatus = [];
    containers.forEach((container) => this.addContainer(container));
    this.containersLock.release();
  }

  setDockerPort(port: MessagePort) {
    this.dockerPort = port;
    this.dockerPort.on("message", async (msg: DockerManagerMessage) => {
      switch (msg.type) {
        case DockerManagerMessageType.UpdateAvailableContainers:
          await this.updateAvailableContainers(msg.containersServiceData);
          return;
      }
    });
  }

  setTaskManagerPort(port: MessagePort) {
    this.taskManagerPort = port;
    this.taskManagerPort.on("message", async (msg: TaskManagerMessage) => {
      switch (msg.type) {
        case TaskManagerMessageType.FreeContainer:
          await this.containersLock.acquire();
          let container = this.containersStatus.filter(
            (c) => c.id === msg.containerId
          )[0];
          if (container) container.isBusy = false;
          this.containersLock.release();
          return;
      }
    });
  }
}

async function main() {
  const loadBalancer = new LoadBalancer();
  parentPort?.on("message", async (msg: PortMessage) => {
    switch (msg.recipient) {
      case Recipient.CppService:
        loadBalancer.setServicePort(msg.port);
        break;
      case Recipient.DockerManager:
        loadBalancer.setDockerPort(msg.port);
        break;
      case Recipient.TaskManager:
        loadBalancer.setTaskManagerPort(msg.port);
        break;
    }
  });

  while (true) {
    loadBalancer.ScheduleTask();
    await WaitForMs(500);
  }
}

main();
