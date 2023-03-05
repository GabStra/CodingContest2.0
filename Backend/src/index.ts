import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import uuid from "uuid-random";
import axios from "axios";
import { PriorityRoundRobin, RandomRoundRobin } from "round-robin-js";

import fs from "fs/promises";
import { EventEmitter } from "events";
import { waitFor } from "wait-for-event";
import {
  initDocker,
  ContainersData,
  HealthCheck,
  ContainerData,
} from "./manager";
import { CppRequest, CppResponse } from "../../Shared/compiled_proto/cpp";
import { Lock } from "async-await-mutex-lock";
import { millisecFromProcessHrTime as msFromHrTime, WaitForMs } from "./utils";

const app: Express = express();
const port = process.env.PORT;

const fileNames = ["code.cpp"];
const TIME_THRESHOLD_MS = 15000;
const emitter = new EventEmitter();
emitter.setMaxListeners(5000);

const lock = new Lock();
const taskLock = new Lock();
async function WaitAndRunCpp(
  id: number,
  startTime: number,
  container: ContainerData,
  cppRequest: CppRequest
) {
  let lockReleased = false;
  await lock.acquire();
  if (!container.isFree) {
    let elapsedInMs = msFromHrTime(
      process.hrtime(container.LastExecutionHrTime)
    );
    if (elapsedInMs < TIME_THRESHOLD_MS) {
      lock.release();
      lockReleased = true;
      //console.log(id, "IS WAITING");
      await WaitForMs(TIME_THRESHOLD_MS - elapsedInMs);
    }
  }
  if (lockReleased) await lock.acquire();
  container.inQueue = false;
  container.LastExecutionHrTime = process.hrtime();
  container.isFree = false;
  lock.release();
  emitter.emit("done");

  var endTime = new Date().getTime();
  let elapsed = endTime - startTime;
  //console.log(id, "SENT", container.id, elapsed / 1000);
  let response = await container.client.runCpp(cppRequest);

  await lock.acquire();
  container.isFree = true;
  lock.release();
  emitter.emit("done");
  return response;
}

async function AnyAvailableContainer() {
  await lock.acquire();
  let result =
    ContainersData.some((c) => !c.inQueue) ||
    ContainersData.some((c) => c.isFree);
  lock.release();
  return result;
}

//let tasks: { (container: ContainerData): void }[] = [];
let tasks: any[] = [];
async function SchedulerManager() {
  while (true) {
    await ScheduleTask();
    await WaitForMs(200);
  }
}

async function ScheduleTask() {
  let anyAvailableContainer = await AnyAvailableContainer();
  if (!anyAvailableContainer) {
    await waitFor("done", emitter);
  }

  await taskLock.acquire();
  let stop = tasks.length === 0;
  taskLock.release();
  if (stop) return;

  await lock.acquire();

  let freeContainers = ContainersData.filter((c) => c.isFree);
  let availableContainers =
    freeContainers.length !== 0
      ? freeContainers
      : ContainersData.filter((c) => !c.inQueue);

  if (!availableContainers || availableContainers.length === 0) {
    lock.release();
    ScheduleTask();
    return;
  }

  lock.release();

  await taskLock.acquire();
  while (availableContainers.length !== 0) {
    await lock.acquire();
    let containersRoundRobin = new RandomRoundRobin<ContainerData>(
      availableContainers
    );

    let container = containersRoundRobin.next().value;
    container.inQueue = true;
    lock.release();
    let action = tasks.shift();

    let start = new Date().getTime();
    compileAndRunCpp(action.id, start, action.file, container);

    taskIds.shift();

    let stop = tasks.length === 0;

    if (stop) break;

    availableContainers = availableContainers.filter(
      (c) => c.id !== container.id
    );
  }
  taskLock.release();
}

async function compileAndRunCpp(
  id: number,
  startTime: number,
  codeFilename: string,
  container: ContainerData
) {
  let base = await fs.readFile("app.cpp", "utf8");
  let code = await fs.readFile(codeFilename, "utf8");
  let source = base.replace("{code}", code);

  let cpp: CppRequest = {
    id: uuid(),
    code: source,
    input: await fs.readFile("input.txt", "utf8"),
  };

  let response = await WaitAndRunCpp(id, startTime, container, cpp);
  var endTime = new Date().getTime();
  let elapsed = endTime - startTime;
  let hasFailed = !response.output;
  console.log(
    id,
    "Executed in:",
    elapsed / 1000 + "s ",
    hasFailed ? "F" : "S",
    codeFilename
  );
}

const taskIds: number[] = [];
async function main() {
  try {
    let docker = await initDocker(
      Number(process.env.CONTAINER_COUNT),
      Number(process.env.CONTAINER_MEMORY)
    );

    await WaitForMs(6000);
    SchedulerManager();
    let id = 0;
    while (true) {
      id += 1;
      await taskLock.acquire();
      tasks.push({
        id: id,
        file: fileNames[0],
      });
      taskIds.push(id);
      taskLock.release();
      await WaitForMs(1000);
    }
  } catch (err) {
    console.log(err);
    /*await new Promise((r) => setTimeout(r, 5000));
    main(); */
  }
}

main();
