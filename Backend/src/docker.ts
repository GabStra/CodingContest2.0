import Dockerode from "dockerode";
import { ContainerData } from "./docker/classes";

export const Containers: ContainerData[] = [];

export async function ClearContainers(dockerClient: Dockerode) {
  await new Promise((resolve, reject) => {
    dockerClient.listContainers(function (err, containers) {
      try {
        containers!.forEach(function (containerInfo) {
          dockerClient.getContainer(containerInfo.Id).kill();
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

export async function CreateDocker(url: string | undefined, port: number) {
  return new Dockerode({
    host: url ?? "0.0.0.0",
    port: port,
  });
}
