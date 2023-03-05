import { parentPort } from "worker_threads";
import dotenv from "dotenv";
dotenv.config();
import {
  millisecFromProcessHrTime as msFromHrTime,
  WaitForMs,
} from "../../utils";
import {
  CppDefinition,
  CppRequest,
  CppResponse,
} from "../../../../Shared/compiled_proto/cpp";
import {
  ClearContainers,
  Containers,
  CreateContainer,
  CreateDocker as CreateDockerClient,
} from "../../docker";
import { WorkerMessage, WorkerMessageType } from "./communication";
import { ContainerData } from "../classes";
import { ChannelCredentials, createChannel, createClient } from "nice-grpc";
import { Container } from "dockerode";

const clientsByContainerId = new Map<string, any>();

const containerById = new Map<string, Container>();
const containerDataById = new Map<string, ContainerData>();

const abortByTaskId = new Map<string, AbortController>();

function SendUpdateContainerMessage(container: ContainerData) {
  parentPort!.postMessage({
    type: WorkerMessageType.UpdateContainer,
    container: container,
  } as WorkerMessage);
}

function SendCppResponseMessage(cppResponse: CppResponse) {
  parentPort!.postMessage({
    type: WorkerMessageType.SendCppResponse,
    cppResponse: cppResponse,
  } as WorkerMessage);
}

async function ProcessTask(cppRequest: CppRequest, container: ContainerData) {
  let abortController = new AbortController();
  abortByTaskId.set(cppRequest.id, abortController);
  let result = await clientsByContainerId
    .get(container.id)
    .runCpp(cppRequest, { signal: abortController.signal });
  container.isBusy = false;
  SendUpdateContainerMessage(container);
  return result;
}

async function StopTask(id: string) {
  if (abortByTaskId.has(id)) {
    abortByTaskId.get(id)?.abort();
  }
}

async function main() {
  try {
    let dockerClient = CreateDockerClient(
      process.env.DOCKER_URL,
      Number(process.env.DOCKER_PORT)
    );

    await ClearContainers(dockerClient);

    let containerCount = Number(process.env.CPP_CONTAINER_COUNT);
    for (let i = 0; i < containerCount; i++) {
      let port = Number(process.env.CPP_CONTAINER_PORT_START) + i;
      let container = await CreateContainer(
        dockerClient,
        "cpp-" + i,
        process.env.CPP_IMAGE_NAME!,
        port,
        Number(process.env.CPP_CONTAINER_MEMORY)
      );

      const channel = createChannel(
        "0.0.0.0:" + port,
        ChannelCredentials.createInsecure()
      );
      let client = createClient(CppDefinition, channel);
      clientsByContainerId.set(container.id, client);
      containerById.set(container.id, container);
      containerDataById.set(
        container.id,
        new ContainerData(container.id, true, true)
      );
      container.start();
    }

    parentPort!.postMessage({
      type: WorkerMessageType.SetContainersData,
      containers: Array.from(containerDataById.values()),
    } as WorkerMessage);
  } catch (err) {
    console.error(err);
    await WaitForMs(5000);
    main();
  }

  await WaitForMs(5000);

  parentPort!.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.SendNewTask:
        let cppResponse = await ProcessTask(msg.cppRequest, msg.container);
        SendCppResponseMessage(cppResponse);
        return;
      case WorkerMessageType.StopTask:
        StopTask(msg.cppRequest.id);
        return;
    }
  });
}

main();
