import {
  CreateDockerClient,
  CreateContainer,
  ClearContainers,
} from "../docker/utils";

import Dockerode, { Container } from "dockerode";
import { MessagePort, parentPort } from "worker_threads";
import {
  ContainerServiceData,
  DockerManagerMessage,
  DockerManagerMessageType,
} from "../message/docker_manager";
import dotenv from "dotenv";
import { WaitForMs } from "../helper/utils";
import { PortMessage, Recipient } from "../message/port_sharing";
import {
  TaskManagerMessage,
  TaskManagerMessageType,
} from "../message/task_manager";
dotenv.config();
class DockerManager {
  dockerode: Dockerode;
  taskManagerPort: MessagePort | null = null;
  loadBalancerPort: MessagePort | null = null;
  containersServiceData: ContainerServiceData[] = [];
  constructor() {
    this.dockerode = CreateDockerClient(
      process.env.DOCKER_URL,
      Number(process.env.DOCKER_PORT)
    );
  }

  async initContainers() {
    let containerCount = Number(process.env.CPP_CONTAINER_COUNT);
    this.containersServiceData = [];
    for (let i = 0; i < containerCount; i++) {
      let port = Number(process.env.CPP_CONTAINER_PORT_START) + i;
      let container = await CreateContainer(
        this.dockerode,
        process.env.CPP_IMAGE_NAME!,
        port,
        Number(process.env.CPP_CONTAINER_MEMORY)
      );
      this.containersServiceData.push({
        id: container.id,
        serviceUrl: process.env.DOCKER_URL + ":" + port,
      });
      await container.start();
    }

    this.taskManagerPort?.postMessage({
      type: DockerManagerMessageType.UpdateAvailableContainers,
      containersServiceData: this.containersServiceData,
    } as DockerManagerMessage);
  }

  async ClearContainers() {
    await ClearContainers(this.dockerode);
  }

  setTaskManagerPort(port: MessagePort) {
    this.taskManagerPort = port;
    this.taskManagerPort.on("message", async (msg: TaskManagerMessage) => {
      switch (msg.type) {
        case TaskManagerMessageType.ChannelsReady:
          this.loadBalancerPort?.postMessage({
            type: DockerManagerMessageType.UpdateAvailableContainers,
            containersServiceData: this.containersServiceData,
          } as DockerManagerMessage);
          return;
      }
    });
  }
  //pi
  setLoadBalancerPort(port: MessagePort) {
    this.loadBalancerPort = port;
  }
}

async function main() {
  let dockerManager = new DockerManager();
  parentPort?.on("message", async (msg: PortMessage) => {
    switch (msg.recipient) {
      case Recipient.TaskManager:
        dockerManager.setTaskManagerPort(msg.port);
        break;
      case Recipient.LoadBalancer:
        dockerManager.setLoadBalancerPort(msg.port);
        break;
    }
  });

  await dockerManager.ClearContainers();
  await WaitForMs(2000);
  await dockerManager.initContainers();

  while (true) {
    await WaitForMs(500);
  }
}

main();
