export enum DockerManagerMessageType {
  UpdateAvailableContainers,
}

export interface DockerManagerMessage {
  type: DockerManagerMessageType;
  containersServiceData: ContainerServiceData[];
}

export interface ContainerServiceData {
  id: string;
  serviceUrl: string;
}
