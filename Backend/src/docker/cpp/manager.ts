import { EventEmitter } from "events";
import { waitFor } from "wait-for-event";
import express from "express";

import { Worker } from "worker_threads";
import { WorkerMessage, WorkerMessageType } from "./communication";
import uuid from "uuid-random";
import fs from "fs/promises";
import { CppRequest, CppResponse } from "../../../../Shared/compiled_proto/cpp";

export function initWorker() {
  const emitter = new EventEmitter();
  const responseByTaskId = new Map<string, CppResponse>();

  const worker = new Worker("./dist/Backend/src/docker/cpp/load_balancer.js");
  worker.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.SendCppResponse:
        console.log(msg.cppResponse);
        responseByTaskId.set(msg.cppResponse.id, msg.cppResponse);
        emitter.emit(msg.cppResponse.id);
    }
  });
}

export function CppRouter() {
  const emitter = new EventEmitter();
  const responseByTaskId = new Map<string, CppResponse>();

  const worker = new Worker("./dist/Backend/src/docker/cpp/load_balancer.js");
  worker.on("message", async (msg: WorkerMessage) => {
    switch (msg.type) {
      case WorkerMessageType.SendCppResponse:
        responseByTaskId.set(msg.cppResponse.id, msg.cppResponse);
        emitter.emit(msg.cppResponse.id);
    }
  });

  var router = express.Router();
  const fileNames = ["code.cpp"];

  router.post("/run-cpp", async (req, res, next) => {
    let cppRequest: CppRequest = req.body;

    let base = await fs.readFile("app.cpp", "utf8");
    let code = await fs.readFile(fileNames[0], "utf8");
    let source = base.replace("{code}", code);

    let cpp: CppRequest = {
      id: uuid(),
      code: source,
      input: await fs.readFile("input.txt", "utf8"),
    };
    worker.postMessage({
      type: WorkerMessageType.SendNewTask,
      cppRequest: cpp,
    } as WorkerMessage);

    console.log(cpp.id);
    await waitFor(cpp.id, emitter);
    res.send(responseByTaskId.get(cpp.id));
    responseByTaskId.delete(cpp.id);
  });

  return router;
}
