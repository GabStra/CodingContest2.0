import express from "express";
import { Worker } from "worker_threads";
import { WorkerMessage, WorkerMessageType } from "./communication";
import uuid from "uuid-random";
import fs from "fs/promises";
import { CppRequest, CppResponse } from "../../../../Shared/compiled_proto/cpp";
import { EventEmitter2 } from "eventemitter2";
export function initWorker() {
  const emitter = new EventEmitter2();
  const responseByTaskId = new Map<string, CppResponse>();

  const worker = new Worker("./dist/Backend/src/docker/cpp/load_balancer.js");
  worker.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.TaskResult:
        responseByTaskId.set(msg.cppResponse.id, msg.cppResponse);
        emitter.emit(msg.cppResponse.id);
    }
  });
}

export function CppRouter() {
  const emitter = new EventEmitter2();
  const responseByTaskId = new Map<string, CppResponse>();

  const worker = new Worker("./dist/Backend/src/docker/cpp/load_balancer.js");
  worker.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.TaskResult:
        responseByTaskId.set(msg.cppResponse.id, msg.cppResponse);
        emitter.emit(msg.cppResponse.id, WorkerMessageType.TaskResult);
        return;
      case WorkerMessageType.Error:
        emitter.emit(msg.cppRequest.id, WorkerMessageType.Error);
        return;
    }
  });

  var router = express.Router();
  const fileNames = ["code.cpp"];

  router.post("/run-cpp", async (req, res, next) => {
    let cppRequest: CppRequest = req.body;

    let base = await fs.readFile("app.cpp", "utf8");
    let source = base.replace("{code}", cppRequest.code);

    let cpp: CppRequest = {
      id: cppRequest.id,
      code: source,
      input: await fs.readFile("input.txt", "utf8"),
    };
    worker.postMessage({
      type: WorkerMessageType.NewTask,
      cppRequest: cpp,
    } as WorkerMessage);

    const result = await emitter.waitFor(cpp.id);

    let type: WorkerMessageType = result[0];
    switch (type) {
      case WorkerMessageType.TaskResult:
        res.send(responseByTaskId.get(cpp.id));
        responseByTaskId.delete(cpp.id);
        return;
      case WorkerMessageType.Error:
        res.send("STOP");
        return;
    }
  });

  router.post("/stop-cpp", async (req, res, next) => {
    let cppRequest: CppRequest = req.body;
    worker.postMessage({
      type: WorkerMessageType.StopTask,
      cppRequest: cppRequest,
    } as WorkerMessage);
    res.send("OK");
  });

  return router;
}
