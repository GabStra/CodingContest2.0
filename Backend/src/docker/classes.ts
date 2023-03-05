import { millisecFromProcessHrTime } from "../utils";
import { IContainerData } from "./interfaces";

export class ContainerData implements IContainerData {
  id: string;

  isReady: boolean;
  isHealthy: boolean;
  LastExecutionHrTime: [number, number];
  inQueue: boolean;
  isBusy: boolean;

  constructor(id: string, isReady: boolean, isHealthy: boolean) {
    this.id = id;

    this.isReady = isReady;
    this.isHealthy = isHealthy;
    this.LastExecutionHrTime = [0, 0];
    this.inQueue = false;
    this.isBusy = false;
  }
  getTime(): number {
    return millisecFromProcessHrTime(this.LastExecutionHrTime);
  }
}
