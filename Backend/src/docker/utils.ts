import Dockerode from "dockerode";
import { WaitForMs } from "../helper/utils";

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

export async function ClearContainers(dockerClient: Dockerode) {
  let containerInfo: Dockerode.ContainerInfo[] =
    await dockerClient.listContainers();
  containerInfo.forEach(async (containerInfo) => {
    let container = await dockerClient.getContainer(containerInfo.Id);
    await container.kill();
    await WaitForMs(2000);
    await container.remove();
  });
}

export function CreateDockerClient(url: string | undefined, port: number) {
  return new Dockerode({
    host: url ?? "0.0.0.0",
    port: port,
  });
}
