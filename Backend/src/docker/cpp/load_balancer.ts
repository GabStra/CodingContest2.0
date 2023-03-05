import { parentPort } from "worker_threads";
import { Lock } from "async-await-mutex-lock";
import { Worker } from "worker_threads";
import { WaitForMs } from "../../utils";
import { WorkerMessage, WorkerMessageType } from "./communication";
import { CppRequest } from "../../../../Shared/compiled_proto/cpp";
import { ContainerData } from "../classes";

async function OnReceiveNewTask(cppRequest: CppRequest) {
  await taskLock.acquire();
  cppRequests.push(cppRequest);
  taskLock.release();
}

async function OnUpdateContainer(container: ContainerData) {
  await containersLock.acquire();
  let index = ContainersData.findIndex((c) => c.id === container.id);
  ContainersData[index] = container;
  containersLock.release();
}

async function ScheduleTask() {
  await taskLock.acquire();
  let stop = cppRequests.length === 0;
  taskLock.release();
  if (stop) return;

  await containersLock.acquire();
  let anyAvailableContainer = ContainersData.some((c) => !c.isBusy);
  if (!anyAvailableContainer) {
    containersLock.release();
    return;
  }
  let availableContainers = ContainersData.filter((c) => !c.isBusy);

  if (!availableContainers || availableContainers.length === 0) {
    return;
  }

  await taskLock.acquire();
  let container = availableContainers[0];
  let index = ContainersData.findIndex((c) => c.id === container.id);
  ContainersData[index].isBusy = true;
  let cppRequest = cppRequests.shift();
  worker.postMessage({
    type: WorkerMessageType.SendNewTask,
    cppRequest: cppRequest,
    container: container,
  } as WorkerMessage);
  taskLock.release();

  containersLock.release();
}

var worker: Worker;
var ContainersData: ContainerData[] = [];
const containersLock = new Lock();
const taskLock = new Lock();
const cppRequests: CppRequest[] = [];

async function main() {
  parentPort!.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.SendNewTask:
        //console.log("RECEIVED", msg.task.id);
        await OnReceiveNewTask(msg.cppRequest);
        return;
    }
  });

  console.log("HELLO BALANCER");
  worker = new Worker("./dist/Backend/src/docker/cpp/scheduler.js");

  worker.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.UpdateContainer:
        await OnUpdateContainer(msg.container);
        return;
      case WorkerMessageType.SetContainersData:
        ContainersData = msg.containers;
        return;
      case WorkerMessageType.SendCppResponse:
        parentPort!.postMessage(msg);
        return;
    }
  });

  while (true) {
    ScheduleTask();
    await WaitForMs(500);
  }
}

main();
