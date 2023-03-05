import Dockerode from "dockerode";
import { ContainerData } from "./docker/classes";
import { WaitForMs } from "./utils";

export const Containers: ContainerData[] = [];

export async function ClearContainers(dockerClient: Dockerode) {
  await new Promise((resolve, reject) => {
    dockerClient.listContainers(function (err, containers) {
      try {
        containers!.forEach(async (containerInfo) => {
          dockerClient.getContainer(containerInfo.Id).kill();
          await WaitForMs(2000);
          dockerClient.getContainer(containerInfo.Id).remove();
        });
        resolve(1);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function CreateContainer(
  dockerClient: Dockerode,
  containerName: string,
  imageName: string,
  containerPort: number,
  memory: number
) {
  let hostPort = String(containerPort);
  return await dockerClient.createContainer({
    Image: imageName,
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
}

export function CreateDocker(url: string | undefined, port: number) {
  return new Dockerode({
    host: url ?? "0.0.0.0",
    port: port,
  });
}
