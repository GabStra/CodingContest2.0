import Dockerode from "dockerode";
import axios from "axios";

import { ChannelCredentials, createChannel, createClient } from "nice-grpc";
import { CppClient, CppDefinition } from "../../Shared/compiled_proto/cpp";

export interface ContainerStatus {
  cpu: {
    usage: number;
    loadAvg1: number;
    loadAvg5: number;
    loadAvg15: number;
  };
  mem: {
    free: number;
    process: number;
  };
  tick: {
    avgMs: number;
    maxMs: number;
    perSec: number;
  };
  healthy: boolean;
  isRunning: boolean;
}

export interface IContainerData {
  id: string;
  port: number;
  isReady: boolean;
  status: ContainerStatus | null;
  isHealthy: boolean;
  client: CppClient;
  getLoad(): number;
}

export class ContainerData implements IContainerData {
  id: string;
  port: number;
  isReady: boolean;
  status: ContainerStatus | null;
  isHealthy: boolean;
  client: CppClient;
  constructor(
    id: string,
    port: number,
    isReady: boolean,
    status: ContainerStatus | null,
    isHealthy: boolean
  ) {
    this.id = id;
    this.port = port;
    this.isReady = isReady;
    this.status = status;
    this.isHealthy = isHealthy;
    const channel = createChannel(
      "0.0.0.0:" + port,
      ChannelCredentials.createInsecure()
    );
    this.client = createClient(CppDefinition, channel);
  }

  getLoad(): number {
    if (!this.status) return 99999;
    let load =
      Number(this.isHealthy) + this.status.mem.free + this.status.cpu.loadAvg5;
    if (this.status.isRunning) load += 100;
    return load;
  }
}

const activateHealthCheck = true;

const HEALTH_CHECK_FREQUENCY = 10000;

export const ContainersData: ContainerData[] = [];

async function HealthCheckContainer(containerData: ContainerData) {
  const response = await axios.get(
    `http://localhost:${containerData.port}/health`
  );

  containerData.isHealthy = response.status === 200;
  containerData.status = response?.data;
}

export async function HealthCheck() {
  while (activateHealthCheck) {
    let promises = ContainersData?.map((containerData) =>
      HealthCheckContainer(containerData)
    );
    await Promise.allSettled(promises);
    await new Promise((r) => setTimeout(r, HEALTH_CHECK_FREQUENCY));
  }
}

export async function initDocker(containers: number, memory: number) {
  let docker = new Dockerode({
    host: process.env.DOCKER_URL ?? "0.0.0.0",
    port: process.env.DOCKER_PORT ?? 2375,
  });

  await new Promise((resolve, reject) => {
    docker.listContainers(function (err, containers) {
      try {
        containers!.forEach(function (containerInfo) {
          docker.getContainer(containerInfo.Id).kill();
        });
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  });
  await new Promise((r) => setTimeout(r, 10000));

  for (let i = 0; i < containers; i++) {
    let hostPort = String(Number(process.env.CONTAINER_PORT) + i);
    let container = await docker.createContainer({
      Image: "worker",
      HostConfig: {
        Memory: memory,
        ExposedPorts: {
          "80/tcp": {},
        },
        PortBindings: {
          "80/tcp": [
            {
              HostPort: hostPort,
              HostIp: "",
            },
          ],
        },
      } as Dockerode.HostConfig,
    });

    ContainersData.push(
      new ContainerData(container.id, Number(hostPort), true, null, true)
    );
    container.start();
  }

  return docker;
}
