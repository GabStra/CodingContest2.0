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

  isReady: boolean;
  LastExecutionHrTime: [number, number];
  inQueue: boolean;
  isBusy: boolean;
  getTime(): number;
}
